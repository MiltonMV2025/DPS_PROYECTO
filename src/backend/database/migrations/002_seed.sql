-- =====================================================================
-- Sonrisa Digital · datos de prueba (seed)
-- Uso:  mysql -u root -p sonrisa_db < 02_seed.sql
--
-- Contraseña de TODAS las cuentas: Dps2026*
-- Hash bcrypt (cost 10) verificado; sirve tal cual con bcrypt.compare().
-- Fechas ancladas a septiembre de 2026 (semana de la entrega).
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Detalles_Cita_Insumos;
TRUNCATE TABLE Radiografias;
TRUNCATE TABLE Historiales_Clinicos;
TRUNCATE TABLE Facturacion;
TRUNCATE TABLE Lista_Espera;
TRUNCATE TABLE Citas;
TRUNCATE TABLE Insumos;
TRUNCATE TABLE Proveedores;
TRUNCATE TABLE Pacientes;
TRUNCATE TABLE Usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- Usuarios · 4 roles (la rúbrica exige mínimo 2)
-- ---------------------------------------------------------------------
INSERT INTO Usuarios (id_usuario, nombre, correo, rol, password_hash, activo, ultimo_acceso) VALUES
 (1,'Dra. Claudia Menéndez','claudia.menendez@sonrisaperfecta.sv','administrador','$2b$10$dz.KBGHFgGLfBLjH2QuNZet4I9V55vFCBqp7WCM39b8zU6JMSq09W',TRUE,'2026-09-09 08:12:00'),
 (2,'Dr. Ernesto Rivas','ernesto.rivas@sonrisaperfecta.sv','odontologo','$2b$10$dz.KBGHFgGLfBLjH2QuNZet4I9V55vFCBqp7WCM39b8zU6JMSq09W',TRUE,'2026-09-09 07:55:00'),
 (3,'Dra. Silvia Portillo','silvia.portillo@sonrisaperfecta.sv','odontologo','$2b$10$dz.KBGHFgGLfBLjH2QuNZet4I9V55vFCBqp7WCM39b8zU6JMSq09W',TRUE,'2026-09-08 16:40:00'),
 (4,'Gabriela Hernández','recepcion@sonrisaperfecta.sv','recepcionista','$2b$10$dz.KBGHFgGLfBLjH2QuNZet4I9V55vFCBqp7WCM39b8zU6JMSq09W',TRUE,'2026-09-09 08:01:00'),
 (5,'Karla Beltrán','karla.beltran@gmail.com','paciente','$2b$10$dz.KBGHFgGLfBLjH2QuNZet4I9V55vFCBqp7WCM39b8zU6JMSq09W',TRUE,'2026-09-07 19:22:00'),
 (6,'José Antonio Ramos','ja.ramos@gmail.com','paciente','$2b$10$dz.KBGHFgGLfBLjH2QuNZet4I9V55vFCBqp7WCM39b8zU6JMSq09W',TRUE,'2026-09-05 12:10:00'),
 (7,'María Elena Sosa','mesosa@hotmail.com','paciente','$2b$10$dz.KBGHFgGLfBLjH2QuNZet4I9V55vFCBqp7WCM39b8zU6JMSq09W',TRUE,'2026-09-06 09:30:00'),
 (8,'Roberto Cañas','rcanas@outlook.com','paciente','$2b$10$dz.KBGHFgGLfBLjH2QuNZet4I9V55vFCBqp7WCM39b8zU6JMSq09W',TRUE,NULL),
 (9,'Ana Lucía Flores','analu.flores@gmail.com','paciente','$2b$10$dz.KBGHFgGLfBLjH2QuNZet4I9V55vFCBqp7WCM39b8zU6JMSq09W',TRUE,'2026-09-01 18:05:00'),
 (10,'Mauricio Guevara','m.guevara@gmail.com','paciente','$2b$10$dz.KBGHFgGLfBLjH2QuNZet4I9V55vFCBqp7WCM39b8zU6JMSq09W',FALSE,NULL);

-- ---------------------------------------------------------------------
-- Pacientes
-- ---------------------------------------------------------------------
INSERT INTO Pacientes (id_paciente, id_usuario, telefono, fecha_nacimiento, alergias) VALUES
 (1,5,'7845-1290','1994-03-18','Penicilina'),
 (2,6,'7712-0034','1986-11-02',NULL),
 (3,7,'6023-8871','1979-07-25','Látex, ibuprofeno'),
 (4,8,'7290-4415','2001-01-09',NULL),
 (5,9,'7455-6612','1998-05-30','Anestésicos con epinefrina'),
 (6,10,'6688-2031','1965-09-14','Sulfas');

-- ---------------------------------------------------------------------
-- Proveedores
-- ---------------------------------------------------------------------
INSERT INTO Proveedores (id_proveedor, razon_social, categoria, contacto, telefono, correo, ultima_compra, estado) VALUES
 (1,'Dental Supply El Salvador, S.A. de C.V.','Insumos generales','Luis Portillo','2245-7788','ventas@dentalsupply.sv','2026-08-28','activo'),
 (2,'Depósito Odontológico Cuscatlán','Instrumental','Rocío Alvarado','2298-1120','pedidos@doc.sv','2026-09-02','activo'),
 (3,'ImportMed, S.A.','Anestésicos y fármacos','Carlos Menjívar','2260-4491','carlos.menjivar@importmed.sv','2026-07-19','evaluacion'),
 (4,'Radiología Digital SV','Equipo e insumos de rayos X','Ingrid Sánchez','2523-0077','info@radiologiadigital.sv','2026-06-30','inactivo');

-- ---------------------------------------------------------------------
-- Insumos · dos quedan bajo el mínimo, para que el semáforo del
-- dashboard muestre rojo y ámbar en la demo
-- ---------------------------------------------------------------------
INSERT INTO Insumos (id_insumo, nombre, categoria, unidad_medida, stock_actual, stock_minimo, id_proveedor) VALUES
 (1,'Anestesia lidocaína 2%','Anestésicos','cartucho',12,30,3),
 (2,'Guantes de nitrilo talla M','Protección','caja de 100',45,20,1),
 (3,'Resina compuesta A2','Restauración','jeringa',8,10,1),
 (4,'Algodón dental en rollo','Consumibles','paquete',60,25,1),
 (5,'Fresa de diamante troncocónica','Instrumental','unidad',22,15,2),
 (6,'Película radiográfica periapical','Radiología','caja de 50',5,12,4),
 (7,'Mascarilla quirúrgica tricapa','Protección','caja de 50',30,20,1),
 (8,'Amalgama dental encapsulada','Restauración','cápsula',40,20,2);

-- ---------------------------------------------------------------------
-- Citas · pasadas (completadas y canceladas) y próximas
-- ---------------------------------------------------------------------
INSERT INTO Citas (id_cita, id_paciente, id_odontologo, fecha_hora, duracion_min, motivo, estado) VALUES
 (1,1,2,'2026-08-24 09:00:00',45,'Limpieza dental','completada'),
 (2,2,2,'2026-08-26 10:30:00',60,'Extracción de tercer molar','completada'),
 (3,3,3,'2026-08-31 14:00:00',30,'Control de ortodoncia','completada'),
 (4,4,2,'2026-09-02 11:00:00',45,'Resina en primer molar','completada'),
 (5,5,3,'2026-09-03 08:30:00',30,'Evaluación de dolor','cancelada'),
 (6,1,2,'2026-09-07 15:00:00',30,'Control post-limpieza','completada'),
 (7,2,3,'2026-09-11 09:00:00',30,'Revisión de sutura','confirmada'),
 (8,3,2,'2026-09-14 10:00:00',60,'Endodoncia, primera sesión','confirmada'),
 (9,5,2,'2026-09-15 16:00:00',45,'Blanqueamiento','pendiente'),
 (10,6,3,'2026-09-17 08:00:00',30,'Primera consulta','pendiente'),
 (11,4,3,'2026-09-18 14:30:00',45,'Limpieza dental','confirmada'),
 (12,1,3,'2026-09-21 09:30:00',30,'Control semestral','pendiente');

-- ---------------------------------------------------------------------
-- Lista de espera · el hueco del 2026-09-03 (cita 5 cancelada) es el
-- caso de prueba del algoritmo de notificación escalonada
-- ---------------------------------------------------------------------
INSERT INTO Lista_Espera (id_espera, id_paciente, fecha_deseada, franja, motivo, prioridad, estado, notificado_en, id_cita_asignada) VALUES
 (1,6,'2026-09-11','manana','Dolor agudo molar inferior',1,'notificado','2026-09-09 09:15:00',NULL),
 (2,4,'2026-09-11','cualquiera','Limpieza dental',3,'en_espera',NULL,NULL),
 (3,3,'2026-09-14','tarde','Adelantar endodoncia',2,'en_espera',NULL,NULL),
 (4,5,'2026-09-15','manana','Blanqueamiento',4,'en_espera',NULL,NULL),
 (5,2,'2026-09-11','manana','Revisión de sutura',2,'asignada','2026-09-08 17:40:00',7),
 (6,1,'2026-09-18','cualquiera','Control',5,'descartada','2026-09-05 10:00:00',NULL);

-- ---------------------------------------------------------------------
-- Historiales clínicos (solo de las citas completadas)
-- ---------------------------------------------------------------------
INSERT INTO Historiales_Clinicos (id_historial, id_cita, diagnostico, tratamiento, observaciones) VALUES
 (1,1,'Gingivitis leve por acumulación de placa','Profilaxis y aplicación de flúor','Se indica cepillado interdental diario'),
 (2,2,'Tercer molar inferior derecho retenido','Exodoncia quirúrgica con sutura','Control de sutura en 15 días. Alergia a penicilina descartada'),
 (3,3,'Maloclusión clase I en tratamiento','Ajuste de arco y cambio de ligaduras','Avance conforme a lo planificado'),
 (4,4,'Caries oclusal en pieza 36','Obturación con resina compuesta A2',NULL),
 (5,6,'Encía sana, sin recidiva de placa','Control y pulido','Alta del tratamiento periodontal');

-- ---------------------------------------------------------------------
-- Radiografías (Módulo de manejo de imágenes)
-- ---------------------------------------------------------------------
INSERT INTO Radiografias (id_radiografia, id_historial, url_archivo, descripcion, fecha) VALUES
 (1,2,'https://res.cloudinary.com/sonrisa-digital/image/upload/v1756200000/rx/rx_paciente2_panoramica.jpg','Panorámica previa a exodoncia','2026-08-26'),
 (2,2,'https://res.cloudinary.com/sonrisa-digital/image/upload/v1756200100/rx/rx_paciente2_periapical.jpg','Periapical de control','2026-08-26'),
 (3,3,'https://res.cloudinary.com/sonrisa-digital/image/upload/v1756500000/rx/rx_paciente3_lateral.jpg','Lateral de cráneo, control de ortodoncia','2026-08-31'),
 (4,4,'https://res.cloudinary.com/sonrisa-digital/image/upload/v1756800000/rx/rx_paciente4_bitewing.jpg','Bitewing pieza 36','2026-09-02');

-- ---------------------------------------------------------------------
-- Insumos consumidos por cita (descuenta inventario en la lógica real)
-- ---------------------------------------------------------------------
INSERT INTO Detalles_Cita_Insumos (id_detalle, id_cita, id_insumo, cantidad) VALUES
 (1,1,2,1),(2,1,4,2),
 (3,2,1,3),(4,2,2,2),(5,2,6,2),
 (6,3,2,1),(7,3,5,1),
 (8,4,3,1),(9,4,5,2),(10,4,2,1),
 (11,6,2,1),(12,6,4,1);

-- ---------------------------------------------------------------------
-- Facturación (Módulo de reportes con gráfica)
-- ---------------------------------------------------------------------
INSERT INTO Facturacion (id_factura, id_cita, monto_total, metodo_pago, estado, fecha_emision) VALUES
 (1,1,35.00,'efectivo','pagada','2026-08-24 09:50:00'),
 (2,2,150.00,'tarjeta','pagada','2026-08-26 11:35:00'),
 (3,3,45.00,'transferencia','pagada','2026-08-31 14:35:00'),
 (4,4,60.00,'efectivo','pagada','2026-09-02 11:50:00'),
 (5,6,20.00,'efectivo','pendiente','2026-09-07 15:35:00');

-- ---------------------------------------------------------------------
-- Verificación rápida
-- ---------------------------------------------------------------------
SELECT 'Usuarios' AS tabla, COUNT(*) AS filas FROM Usuarios
UNION ALL SELECT 'Pacientes', COUNT(*) FROM Pacientes
UNION ALL SELECT 'Proveedores', COUNT(*) FROM Proveedores
UNION ALL SELECT 'Insumos', COUNT(*) FROM Insumos
UNION ALL SELECT 'Citas', COUNT(*) FROM Citas
UNION ALL SELECT 'Lista_Espera', COUNT(*) FROM Lista_Espera
UNION ALL SELECT 'Historiales_Clinicos', COUNT(*) FROM Historiales_Clinicos
UNION ALL SELECT 'Radiografias', COUNT(*) FROM Radiografias
UNION ALL SELECT 'Detalles_Cita_Insumos', COUNT(*) FROM Detalles_Cita_Insumos
UNION ALL SELECT 'Facturacion', COUNT(*) FROM Facturacion;
