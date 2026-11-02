ALTER TABLE Usuarios
  ADD COLUMN firebase_uid VARCHAR(128) NULL,
  ADD UNIQUE KEY uq_usuarios_firebase_uid (firebase_uid);
