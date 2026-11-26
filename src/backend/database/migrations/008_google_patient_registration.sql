-- Google-only mobile patient accounts do not have a local password.
-- Existing bcrypt hashes remain unchanged.
ALTER TABLE Usuarios
  MODIFY COLUMN password_hash CHAR(60) NULL COMMENT 'bcrypt, 60 characters; NULL for Google-only accounts';
