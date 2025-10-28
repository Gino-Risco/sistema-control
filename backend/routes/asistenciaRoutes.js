// backend/routes/asistenciaRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/asistencia
 * Obtiene registros de asistencia con filtros opcionales:
 * - fecha_inicio (YYYY-MM-DD)
 * - fecha_fin (YYYY-MM-DD)
 * - dni (texto parcial)
 */
router.get('/', async (req, res) => {
  const { fecha_inicio, fecha_fin, dni } = req.query;

  let query = `
    SELECT 
      r.id,
      t.dni,
      CONCAT(t.nombres, ' ', t.apellidos) AS nombre_completo,
      a.nombre_area,
      r.fecha,
      r.hora_entrada,
      r.hora_salida,
      r.minutos_tardanza,
      r.estado,
      r.metodo_registro
    FROM registros_asistencia r
    INNER JOIN trabajadores t ON r.trabajador_id = t.id
    INNER JOIN areas a ON t.id_area = a.id
    WHERE 1=1
  `;
  const params = [];

  if (fecha_inicio) {
    query += ` AND r.fecha >= ?`;
    params.push(fecha_inicio);
  }
  if (fecha_fin) {
    query += ` AND r.fecha <= ?`;
    params.push(fecha_fin);
  }
  if (dni) {
    query += ` AND t.dni LIKE ?`;
    params.push(`%${dni}%`);
  }

  query += ` ORDER BY r.fecha DESC, r.hora_entrada DESC`;

  try {
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener asistencias:', error);
    res.status(500).json({ error: 'Error al obtener registros de asistencia' });
  }
});

/**
 * POST /api/asistencia
 * Registra entrada o salida según el estado actual del día.
 * Espera: { "codigo_qr": "QR-75123456-123456789" }
 */
router.post('/', async (req, res) => {
  const { codigo_qr } = req.body;

  if (!codigo_qr) {
    return res.status(400).json({ error: 'El campo "codigo_qr" es requerido' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Buscar trabajador activo por QR
    const [workers] = await conn.execute(
      `SELECT id, horario_entrada FROM trabajadores 
       WHERE codigo_qr = ? AND estado = 'activo'`,
      [codigo_qr]
    );

    if (workers.length === 0) {
      return res.status(404).json({ 
        error: 'Trabajador no encontrado, inactivo o código QR inválido' 
      });
    }

    const trabajador = workers[0];
    const fechaHoy = new Date().toISOString().split('T')[0];
    const horaActual = new Date().toTimeString().split(' ')[0]; // HH:mm:ss

    // Verificar si ya existe registro para hoy
    const [registros] = await conn.execute(
      `SELECT id, hora_entrada, hora_salida 
       FROM registros_asistencia 
       WHERE trabajador_id = ? AND fecha = ?`,
      [trabajador.id, fechaHoy]
    );

    if (registros.length === 0) {
      // 🔹 PRIMERA VEZ HOY: registrar ENTRADA
      const [h, m] = trabajador.horario_entrada.split(':');
      const horaOficial = new Date();
      horaOficial.setHours(h, m, 0, 0);

      const entrada = new Date(`${fechaHoy}T${horaActual}`);
      const diffMin = Math.floor((entrada - horaOficial) / 60000);

      // Obtener tolerancia desde configuración
      const [config] = await conn.execute(
        `SELECT valor FROM configuraciones WHERE clave = 'tolerancia_tardanza'`
      );
      const tolerancia = parseInt(config[0]?.valor) || 15;

      const minutos_tardanza = diffMin > tolerancia ? diffMin - tolerancia : 0;
      const estado = minutos_tardanza > 0 ? 'tardanza' : 'puntual';

      await conn.execute(
        `INSERT INTO registros_asistencia 
         (trabajador_id, fecha, hora_entrada, minutos_tardanza, estado, metodo_registro)
         VALUES (?, ?, ?, ?, ?, 'qr')`,
        [trabajador.id, fechaHoy, horaActual, minutos_tardanza, estado]
      );

      await conn.commit();
      return res.status(201).json({ 
        message: '✅ Entrada registrada', 
        tipo: 'entrada',
        hora: horaActual,
        estado
      });

    } else {
      // 🔹 YA EXISTE REGISTRO: intentar registrar SALIDA
      const registro = registros[0];

      if (registro.hora_salida) {
        // Ya tiene entrada y salida
        await conn.commit();
        return res.status(400).json({ 
          error: 'Ya registró entrada y salida hoy' 
        });
      }

      // Registrar salida
      await conn.execute(
        `UPDATE registros_asistencia 
         SET hora_salida = ? 
         WHERE id = ?`,
        [horaActual, registro.id]
      );

      await conn.commit();
      return res.json({ 
        message: '✅ Salida registrada', 
        tipo: 'salida',
        hora: horaActual 
      });
    }

  } catch (error) {
    await conn.rollback();
    console.error('Error crítico en registro de asistencia:', error);
    res.status(500).json({ error: 'Error interno al procesar la asistencia' });
  } finally {
    conn.release();
  }
});

module.exports = router;