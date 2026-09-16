CREATE TABLE IF NOT EXISTS Notificaciones (
  id_notificacion INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario INT UNSIGNED NOT NULL,
  tipo ENUM('appointment_pending','appointment_confirmed','appointment_cancelled','appointment_completed') NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  mensaje VARCHAR(500) NOT NULL,
  id_cita INT UNSIGNED NULL,
  leida_en DATETIME NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_notificacion),
  KEY ix_notificaciones_usuario (id_usuario, leida_en, creado_en),
  CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_notificaciones_cita FOREIGN KEY (id_cita) REFERENCES Citas (id_cita) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
