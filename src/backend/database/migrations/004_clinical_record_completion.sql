ALTER TABLE Historiales_Clinicos
  ADD COLUMN receta TEXT NULL AFTER observaciones,
  ADD COLUMN recomendaciones TEXT NULL AFTER receta;
