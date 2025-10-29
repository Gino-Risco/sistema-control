-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-10-2025 a las 06:32:04
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `control_asistencia`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas`
--

CREATE TABLE `areas` (
  `id` int(11) NOT NULL,
  `nombre_area` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `areas`
--

INSERT INTO `areas` (`id`, `nombre_area`, `descripcion`, `estado`, `creado_en`) VALUES
(1, 'Producción', 'Área de producción y manufactura', 'activo', '2025-10-29 05:08:51'),
(2, 'Logística', 'Área de logística y distribución', 'activo', '2025-10-29 05:08:51'),
(3, 'Administración', 'Área administrativa y contable', 'activo', '2025-10-29 05:08:51'),
(4, 'Recursos Humanos', 'Área de gestión de personal', 'activo', '2025-10-29 05:08:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuraciones`
--

CREATE TABLE `configuraciones` (
  `id` int(11) NOT NULL,
  `clave` varchar(100) NOT NULL,
  `valor` text DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('string','number','boolean','json') DEFAULT 'string',
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `configuraciones`
--

INSERT INTO `configuraciones` (`id`, `clave`, `valor`, `descripcion`, `tipo`, `actualizado_en`) VALUES
(1, 'tolerancia_tardanza', '15', 'Minutos de tolerancia para tardanza', 'number', '2025-10-29 05:08:51'),
(2, 'horario_entrada_default', '08:00:00', 'Horario de entrada por defecto', 'string', '2025-10-29 05:08:51'),
(3, 'horario_salida_default', '17:00:00', 'Horario de salida por defecto', 'string', '2025-10-29 05:08:51'),
(4, 'dias_laborales', '[1,2,3,4,5]', 'Días laborales (1=Lunes, 7=Domingo)', 'json', '2025-10-29 05:08:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id` int(11) NOT NULL,
  `nombre_turno` varchar(100) NOT NULL,
  `hora_entrada` time NOT NULL,
  `hora_salida` time NOT NULL,
  `dias_laborales` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`dias_laborales`)),
  `tipo` enum('predefinido','personalizado') DEFAULT 'predefinido',
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `horarios`
--

INSERT INTO `horarios` (`id`, `nombre_turno`, `hora_entrada`, `hora_salida`, `dias_laborales`, `tipo`, `estado`, `creado_en`) VALUES
(1, 'Administrativo', '08:00:00', '17:00:00', '[1,2,3,4,5]', 'predefinido', 'activo', '2025-10-29 05:08:51'),
(2, 'Producción Mañana', '06:00:00', '14:00:00', '[1,2,3,4,5,6]', 'predefinido', 'activo', '2025-10-29 05:08:51'),
(3, 'Producción Tarde', '14:00:00', '22:00:00', '[1,2,3,4,5,6]', 'predefinido', 'activo', '2025-10-29 05:08:51'),
(4, '24/7', '00:00:00', '23:59:59', '[1,2,3,4,5,6,7]', 'predefinido', 'activo', '2025-10-29 05:08:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `justificaciones`
--

CREATE TABLE `justificaciones` (
  `id` int(11) NOT NULL,
  `trabajador_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `tipo` enum('tardanza','ausencia','salida_temprano') NOT NULL,
  `motivo` text NOT NULL,
  `archivo_adjunto` varchar(255) DEFAULT NULL,
  `estado` enum('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  `revisado_por` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logs_sistema`
--

CREATE TABLE `logs_sistema` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `accion` varchar(100) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_asistencia`
--

CREATE TABLE `registros_asistencia` (
  `id` int(11) NOT NULL,
  `trabajador_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora_entrada` time DEFAULT NULL,
  `hora_salida` time DEFAULT NULL,
  `minutos_tardanza` int(11) DEFAULT 0,
  `estado` enum('puntual','tardanza','ausente','justificado') DEFAULT 'puntual',
  `metodo_registro` enum('qr','manual') DEFAULT 'qr',
  `justificado` tinyint(1) DEFAULT 0,
  `motivo_justificacion` text DEFAULT NULL,
  `ip_registro` varchar(45) DEFAULT NULL COMMENT 'IP desde donde se registró',
  `dispositivo` varchar(100) DEFAULT NULL COMMENT 'Dispositivo usado para el registro',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `id` int(11) NOT NULL,
  `id_supervisor` int(11) NOT NULL,
  `nombre_reporte` varchar(100) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `tipo_reporte` enum('asistencia','tardanza','general','justificaciones') NOT NULL,
  `parametros` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Parámetros del reporte en formato JSON' CHECK (json_valid(`parametros`)),
  `archivo_generado` varchar(255) DEFAULT NULL COMMENT 'Ruta del archivo generado',
  `estado` enum('generando','completado','error') DEFAULT 'generando',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `permisos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Permisos del rol en formato JSON' CHECK (json_valid(`permisos`)),
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre_rol`, `descripcion`, `permisos`, `creado_en`) VALUES
(1, 'Administrador', 'Acceso total al sistema', '{\"usuarios\": [\"crear\", \"leer\", \"actualizar\", \"eliminar\"], \"reportes\": [\"crear\", \"leer\", \"actualizar\", \"eliminar\"], \"configuracion\": [\"leer\", \"actualizar\"]}', '2025-10-29 05:08:51'),
(2, 'Supervisor', 'Supervisión de personal y reportes', '{\"usuarios\": [\"leer\"], \"reportes\": [\"crear\", \"leer\"], \"asistencia\": [\"leer\", \"actualizar\"]}', '2025-10-29 05:08:51'),
(3, 'Trabajador', 'Acceso básico al sistema', '{\"asistencia\": [\"leer\"]}', '2025-10-29 05:08:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trabajadores`
--

CREATE TABLE `trabajadores` (
  `id` int(11) NOT NULL,
  `dni` varchar(15) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `id_area` int(11) NOT NULL,
  `id_horario` int(11) DEFAULT NULL,
  `codigo_qr` varchar(255) DEFAULT NULL,
  `estado` enum('activo','inactivo','vacaciones','licencia') DEFAULT 'activo',
  `foto` varchar(255) DEFAULT NULL COMMENT 'Ruta relativa de la foto',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `trabajadores`
--

INSERT INTO `trabajadores` (`id`, `dni`, `nombres`, `apellidos`, `email`, `telefono`, `id_area`, `id_horario`, `codigo_qr`, `estado`, `foto`, `creado_en`, `actualizado_en`) VALUES
(1, '75123456', 'James', 'Rodrigues', 'admin@empresa.com', NULL, 3, NULL, 'ADMIN-001', 'activo', '/uploads/foto-1761714602842-814664861.jpg', '2025-10-29 05:08:51', '2025-10-29 05:17:53'),
(2, '76090175', 'Lamin', 'Malendes ', 'Lamin@gmail.com', NULL, 2, NULL, 'QR-76090175-1761714707336', 'activo', '/uploads/foto-1761714707335-479410446.jpg', '2025-10-29 05:11:47', '2025-10-29 05:12:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `contraseña` varchar(255) NOT NULL COMMENT 'Hash bcrypt',
  `estado` enum('activo','inactivo','bloqueado') DEFAULT 'activo',
  `ultimo_login` timestamp NULL DEFAULT NULL,
  `intentos_login` int(11) DEFAULT 0,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `id_rol`, `usuario`, `contraseña`, `estado`, `ultimo_login`, `intentos_login`, `creado_en`, `actualizado_en`) VALUES
(1, 1, 'Gino', '$2b$10$TqM0H7MEap7e0nTUd8mS8.sIluM5grURl2.bEkvX2h5YIwOiAQXKu', 'activo', NULL, 0, '2025-10-29 05:08:51', '2025-10-29 05:11:10'),
(6, 3, 'Norma', '$2b$10$6Q0ermzZKEPvXKeirvdiyewgaqs8S77OSUVr5o7SyLpwRhz8nmzBq', 'inactivo', NULL, 0, '2025-10-29 05:22:36', '2025-10-29 05:24:18'),
(7, 2, 'Pedri', '$2b$10$4NDVoxBnMH2EU.lM8zibNO1w06COC6Um2z0D4NQe0tNMryqoqmNYm', 'activo', NULL, 0, '2025-10-29 05:24:10', '2025-10-29 05:24:10');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_asistencia_detallada`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_asistencia_detallada` (
`registro_id` int(11)
,`trabajador_id` int(11)
,`dni` varchar(15)
,`nombre_completo` varchar(201)
,`nombre_area` varchar(100)
,`fecha` date
,`hora_entrada` time
,`hora_salida` time
,`minutos_tardanza` int(11)
,`estado_asistencia` enum('puntual','tardanza','ausente','justificado')
,`metodo_registro` enum('qr','manual')
,`justificado` tinyint(1)
,`motivo_justificacion` text
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_resumen_mensual`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_resumen_mensual` (
`trabajador_id` int(11)
,`anio` int(4)
,`mes` int(2)
,`total_dias` bigint(21)
,`dias_puntual` decimal(22,0)
,`dias_tardanza` decimal(22,0)
,`dias_ausente` decimal(22,0)
,`dias_justificado` decimal(22,0)
,`promedio_minutos_tardanza` decimal(14,4)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_asistencia_detallada`
--
DROP TABLE IF EXISTS `vista_asistencia_detallada`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_asistencia_detallada`  AS SELECT `r`.`id` AS `registro_id`, `t`.`id` AS `trabajador_id`, `t`.`dni` AS `dni`, concat(`t`.`nombres`,' ',`t`.`apellidos`) AS `nombre_completo`, `a`.`nombre_area` AS `nombre_area`, `r`.`fecha` AS `fecha`, `r`.`hora_entrada` AS `hora_entrada`, `r`.`hora_salida` AS `hora_salida`, `r`.`minutos_tardanza` AS `minutos_tardanza`, `r`.`estado` AS `estado_asistencia`, `r`.`metodo_registro` AS `metodo_registro`, `r`.`justificado` AS `justificado`, `r`.`motivo_justificacion` AS `motivo_justificacion` FROM ((`registros_asistencia` `r` join `trabajadores` `t` on(`r`.`trabajador_id` = `t`.`id`)) join `areas` `a` on(`t`.`id_area` = `a`.`id`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_resumen_mensual`
--
DROP TABLE IF EXISTS `vista_resumen_mensual`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_resumen_mensual`  AS SELECT `registros_asistencia`.`trabajador_id` AS `trabajador_id`, year(`registros_asistencia`.`fecha`) AS `anio`, month(`registros_asistencia`.`fecha`) AS `mes`, count(0) AS `total_dias`, sum(case when `registros_asistencia`.`estado` = 'puntual' then 1 else 0 end) AS `dias_puntual`, sum(case when `registros_asistencia`.`estado` = 'tardanza' then 1 else 0 end) AS `dias_tardanza`, sum(case when `registros_asistencia`.`estado` = 'ausente' then 1 else 0 end) AS `dias_ausente`, sum(case when `registros_asistencia`.`estado` = 'justificado' then 1 else 0 end) AS `dias_justificado`, avg(`registros_asistencia`.`minutos_tardanza`) AS `promedio_minutos_tardanza` FROM `registros_asistencia` GROUP BY `registros_asistencia`.`trabajador_id`, year(`registros_asistencia`.`fecha`), month(`registros_asistencia`.`fecha`) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre_area` (`nombre_area`);

--
-- Indices de la tabla `configuraciones`
--
ALTER TABLE `configuraciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clave` (`clave`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `justificaciones`
--
ALTER TABLE `justificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trabajador_id` (`trabajador_id`),
  ADD KEY `revisado_por` (`revisado_por`);

--
-- Indices de la tabla `logs_sistema`
--
ALTER TABLE `logs_sistema`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_modulo_accion` (`modulo`,`accion`),
  ADD KEY `idx_fecha` (`creado_en`);

--
-- Indices de la tabla `registros_asistencia`
--
ALTER TABLE `registros_asistencia`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_trabajador_fecha` (`trabajador_id`,`fecha`),
  ADD KEY `idx_fecha` (`fecha`),
  ADD KEY `idx_trabajador_fecha` (`trabajador_id`,`fecha`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_supervisor_fecha` (`id_supervisor`,`creado_en`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre_rol` (`nombre_rol`);

--
-- Indices de la tabla `trabajadores`
--
ALTER TABLE `trabajadores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `codigo_qr` (`codigo_qr`),
  ADD KEY `id_horario` (`id_horario`),
  ADD KEY `idx_area` (`id_area`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario` (`usuario`),
  ADD KEY `idx_rol` (`id_rol`),
  ADD KEY `idx_estado` (`estado`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `areas`
--
ALTER TABLE `areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `configuraciones`
--
ALTER TABLE `configuraciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `justificaciones`
--
ALTER TABLE `justificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `logs_sistema`
--
ALTER TABLE `logs_sistema`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `registros_asistencia`
--
ALTER TABLE `registros_asistencia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `trabajadores`
--
ALTER TABLE `trabajadores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `justificaciones`
--
ALTER TABLE `justificaciones`
  ADD CONSTRAINT `justificaciones_ibfk_1` FOREIGN KEY (`trabajador_id`) REFERENCES `trabajadores` (`id`),
  ADD CONSTRAINT `justificaciones_ibfk_2` FOREIGN KEY (`revisado_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `logs_sistema`
--
ALTER TABLE `logs_sistema`
  ADD CONSTRAINT `logs_sistema_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `registros_asistencia`
--
ALTER TABLE `registros_asistencia`
  ADD CONSTRAINT `registros_asistencia_ibfk_1` FOREIGN KEY (`trabajador_id`) REFERENCES `trabajadores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`id_supervisor`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `trabajadores`
--
ALTER TABLE `trabajadores`
  ADD CONSTRAINT `trabajadores_ibfk_1` FOREIGN KEY (`id_area`) REFERENCES `areas` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `trabajadores_ibfk_2` FOREIGN KEY (`id_horario`) REFERENCES `horarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/**/;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
