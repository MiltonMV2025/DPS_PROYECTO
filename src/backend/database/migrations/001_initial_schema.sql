-- =====================================================================
-- Sonrisa Digital · Clínica Dental Sonrisa Perfecta
-- DPS941 · Equipo 404 DPS Devs · Etapa 2 (Sprint 0)
-- Esquema MySQL 8.0 / InnoDB · normalizado a 3FN
--
-- Base: modelo entidad-relación aprobado en la Etapa 1 (8 tablas).
-- Refinamientos de la Etapa 2 (no contradicen la Etapa 1, la completan):
--   + Proveedores      -> la pantalla de Proveedores existe en los mockups
--   + Lista_Espera     -> el Módulo 1 exige lista de espera automatizada
--   + Citas.duracion_min y Citas.motivo -> bloques de 30/45/60 min y
--     el "motivo" que muestran el dashboard y la agenda semanal
--
-- Uso:  mysql -u root -p < 01_schema.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Usuarios  (cuentas del sistema · 4 roles)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Usuarios (
  id_usuario     INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nombre         VARCHAR(120)  NOT NULL,
  correo         VARCHAR(150)  NOT NULL,
  rol            ENUM('administrador','odontologo','recepcionista','paciente')
                               NOT NULL DEFAULT 'paciente',
  password_hash  CHAR(60)      NOT NULL COMMENT 'bcrypt, 60 caracteres',
  activo         BOOLEAN       NOT NULL DEFAULT TRUE,
  ultimo_acceso  DATETIME      NULL,
  creado_en      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuarios_correo (correo),
  KEY ix_usuarios_rol (rol)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. Pacientes  (1:1 con Usuarios · ficha personal)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Pacientes (
  id_paciente       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario        INT UNSIGNED NOT NULL,
  telefono          VARCHAR(20)  NOT NULL,
  fecha_nacimiento  DATE         NOT NULL,
  alergias          TEXT         NULL,
  creado_en         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_paciente),
  UNIQUE KEY uq_pacientes_usuario (id_usuario),
  CONSTRAINT fk_pacientes_usuario
    FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. Proveedores  (añadida en Etapa 2)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Proveedores (
  id_proveedor   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  razon_social   VARCHAR(150) NOT NULL,
  categoria      VARCHAR(80)  NOT NULL,
  contacto       VARCHAR(120) NULL,
  telefono       VARCHAR(20)  NULL,
  correo         VARCHAR(150) NULL,
  ultima_compra  DATE         NULL,
  estado         ENUM('activo','evaluacion','inactivo') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (id_proveedor),
  UNIQUE KEY uq_proveedores_razon (razon_social)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. Insumos  (inventario · semáforo por stock_minimo)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Insumos (
  id_insumo      INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nombre         VARCHAR(120)  NOT NULL,
  categoria      VARCHAR(80)   NOT NULL,
  unidad_medida  VARCHAR(30)   NOT NULL DEFAULT 'unidad',
  stock_actual   INT           NOT NULL DEFAULT 0,
  stock_minimo   INT           NOT NULL DEFAULT 0,
  id_proveedor   INT UNSIGNED  NULL,
  PRIMARY KEY (id_insumo),
  KEY ix_insumos_proveedor (id_proveedor),
  CONSTRAINT fk_insumos_proveedor
    FOREIGN KEY (id_proveedor) REFERENCES Proveedores (id_proveedor)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT ck_insumos_stock CHECK (stock_actual >= 0 AND stock_minimo >= 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. Citas  (núcleo del Módulo 1)
--    El UNIQUE (id_odontologo, fecha_hora) es lo que impide la cita
--    duplicada que hoy ocurre con la agenda de papel.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Citas (
  id_cita        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_paciente    INT UNSIGNED NOT NULL,
  id_odontologo  INT UNSIGNED NOT NULL,
  fecha_hora     DATETIME     NOT NULL,
  duracion_min   SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  motivo         VARCHAR(150) NULL,
  estado         ENUM('pendiente','confirmada','completada','cancelada')
                              NOT NULL DEFAULT 'pendiente',
  creado_en      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_cita),
  UNIQUE KEY uq_citas_agenda (id_odontologo, fecha_hora),
  KEY ix_citas_paciente (id_paciente),
  KEY ix_citas_fecha (fecha_hora),
  CONSTRAINT fk_citas_paciente
    FOREIGN KEY (id_paciente) REFERENCES Pacientes (id_paciente)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_citas_odontologo
    FOREIGN KEY (id_odontologo) REFERENCES Usuarios (id_usuario)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_citas_duracion CHECK (duracion_min IN (30, 45, 60))
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. Lista_Espera  (añadida en Etapa 2 · Sprint 2)
--    Al cancelarse una cita se notifica en orden de prioridad y
--    fecha de registro a quienes esperan esa franja.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Lista_Espera (
  id_espera         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_paciente       INT UNSIGNED NOT NULL,
  fecha_deseada     DATE         NOT NULL,
  franja            ENUM('manana','tarde','cualquiera') NOT NULL DEFAULT 'cualquiera',
  motivo            VARCHAR(150) NULL,
  prioridad         TINYINT UNSIGNED NOT NULL DEFAULT 3 COMMENT '1 = urgencia, 5 = flexible',
  estado            ENUM('en_espera','notificado','asignada','descartada')
                                 NOT NULL DEFAULT 'en_espera',
  notificado_en     DATETIME     NULL,
  id_cita_asignada  INT UNSIGNED NULL,
  creado_en         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_espera),
  KEY ix_espera_turno (estado, fecha_deseada, prioridad, creado_en),
  KEY ix_espera_paciente (id_paciente),
  KEY ix_espera_cita (id_cita_asignada),
  CONSTRAINT fk_espera_paciente
    FOREIGN KEY (id_paciente) REFERENCES Pacientes (id_paciente)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_espera_cita
    FOREIGN KEY (id_cita_asignada) REFERENCES Citas (id_cita)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT ck_espera_prioridad CHECK (prioridad BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. Historiales_Clinicos  (1:1 con Citas)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Historiales_Clinicos (
  id_historial   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cita        INT UNSIGNED NOT NULL,
  diagnostico    TEXT         NOT NULL,
  tratamiento    TEXT         NOT NULL,
  observaciones  TEXT         NULL,
  creado_en      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_historial),
  UNIQUE KEY uq_historial_cita (id_cita),
  CONSTRAINT fk_historial_cita
    FOREIGN KEY (id_cita) REFERENCES Citas (id_cita)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. Radiografias  (url_archivo apunta a S3/Cloudinary, no al binario)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Radiografias (
  id_radiografia  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historial    INT UNSIGNED NOT NULL,
  url_archivo     VARCHAR(500) NOT NULL,
  descripcion     VARCHAR(150) NULL,
  fecha           DATE         NOT NULL,
  PRIMARY KEY (id_radiografia),
  KEY ix_radiografias_historial (id_historial),
  CONSTRAINT fk_radiografias_historial
    FOREIGN KEY (id_historial) REFERENCES Historiales_Clinicos (id_historial)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. Detalles_Cita_Insumos  (puente Citas <-> Insumos)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Detalles_Cita_Insumos (
  id_detalle  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cita     INT UNSIGNED NOT NULL,
  id_insumo   INT UNSIGNED NOT NULL,
  cantidad    INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_detalle),
  UNIQUE KEY uq_detalle_cita_insumo (id_cita, id_insumo),
  KEY ix_detalle_insumo (id_insumo),
  CONSTRAINT fk_detalle_cita
    FOREIGN KEY (id_cita) REFERENCES Citas (id_cita)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_detalle_insumo
    FOREIGN KEY (id_insumo) REFERENCES Insumos (id_insumo)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_detalle_cantidad CHECK (cantidad > 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. Facturacion  (1:1 con Citas)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Facturacion (
  id_factura     INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  id_cita        INT UNSIGNED   NOT NULL,
  monto_total    DECIMAL(10,2)  NOT NULL,
  metodo_pago    ENUM('efectivo','tarjeta','transferencia') NOT NULL,
  estado         ENUM('pendiente','pagada','anulada') NOT NULL DEFAULT 'pendiente',
  fecha_emision  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_factura),
  UNIQUE KEY uq_factura_cita (id_cita),
  KEY ix_factura_fecha (fecha_emision),
  CONSTRAINT fk_factura_cita
    FOREIGN KEY (id_cita) REFERENCES Citas (id_cita)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_factura_monto CHECK (monto_total >= 0)
) ENGINE=InnoDB;
