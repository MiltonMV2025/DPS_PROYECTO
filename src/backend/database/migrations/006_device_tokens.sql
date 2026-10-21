CREATE TABLE IF NOT EXISTS DeviceTokens (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario    INT UNSIGNED NOT NULL,
  token         VARCHAR(500) NOT NULL,
  platform      ENUM('android','ios','web') NOT NULL,
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_device_tokens_usuario_token (id_usuario, token),
  KEY ix_device_tokens_usuario_activo (id_usuario, activo),
  CONSTRAINT fk_device_tokens_usuario
    FOREIGN KEY (id_usuario) REFERENCES Usuarios (id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
