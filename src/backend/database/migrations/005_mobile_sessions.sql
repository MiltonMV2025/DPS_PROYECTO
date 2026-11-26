CREATE TABLE IF NOT EXISTS Sesiones_Mobile (
  id_sesion         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario        INT UNSIGNED NOT NULL,
  familia_token     CHAR(36) NOT NULL,
  token_hash        CHAR(64) NOT NULL,
  reemplazado_por   BIGINT UNSIGNED NULL,
  creado_en         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expira_en         DATETIME NOT NULL,
  ultimo_uso_en     DATETIME NULL,
  revocado_en       DATETIME NULL,
  motivo_revocacion VARCHAR(80) NULL,
  PRIMARY KEY (id_sesion),
  UNIQUE KEY uq_sesiones_mobile_token_hash (token_hash),
  KEY ix_sesiones_mobile_usuario (id_usuario),
  KEY ix_sesiones_mobile_familia (familia_token),
  KEY ix_sesiones_mobile_expiracion (expira_en),
  CONSTRAINT fk_sesiones_mobile_usuario
    FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_sesiones_mobile_reemplazo
    FOREIGN KEY (reemplazado_por) REFERENCES Sesiones_Mobile (id_sesion)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
