// backend/routes/asistenciaRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /api/asistencia → registrar asistencia (QR o manual)
router.post('/', async (req, res) => {
  const { codigo_qr } = req.body;

  if (!codigo_qr) {
    return res.status(400).json({ error: 'Código QR requerido' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Buscar trabajador por QR y obtener su horario
    const [workers] = await conn.execute(`
      SELECT 
        t.id, 
        t.estado,
        h.hora_entrada,
        h.dias_laborales
      FROM trabajadores t
      LEFT JOIN horarios h ON t.id_horario = h.id
      WHERE t.codigo_qr = ? AND t.estado = 'activo'
    `, [codigo_qr]);

    if (workers.length === 0) {
      return res.status(404).json({ error: 'Trabajador no encontrado, inactivo o sin horario asignado' });
    }

    const trabajador = workers[0];
    const fechaHoy = new Date().toISOString().split('T')[0];
    const horaActual = new Date().toTimeString().split(' ')[0];

    // Verificar si es día laborable
    const diaSemana = new Date().getDay() || 7; // 1=Lunes, 7=Domingo
    const diasLaborales = trabajador.dias_laborales 
      ? JSON.parse(trabajador.dias_laborales)
      : [1,2,3,4,5];

    if (!diasLaborales.includes(diaSemana)) {
      return res.status(400).json({ error: 'Hoy no es día laborable para este trabajador' });
    }

    // Verificar si ya existe registro hoy
    const [registros] = await conn.execute(
      `SELECT id, hora_entrada, hora_salida FROM registros_asistencia 
       WHERE trabajador_id = ? AND fecha = ?`,
      [trabajador.id, fechaHoy]
    );

    if (registros.length === 0) {
      // Primera vez: registrar ENTRADA
      const [h, m] = trabajador.hora_entrada.split(':');
      const horaOficial = new Date();
      horaOficial.setHours(h, m, 0, 0);

      const entrada = new Date(`${fechaHoy}T${horaActual}`);
      const diffMin = Math.floor((entrada - horaOficial) / 60000);

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
      return res.json({ message: 'Entrada registrada', tipo: 'entrada' });
    } else {
      // Ya existe: registrar SALIDA
      if (!registros[0].hora_salida) {
        await conn.execute(
          `UPDATE registros_asistencia SET hora_salida = ? WHERE id = ?`,
          [horaActual, registros[0].id]
        );
        await conn.commit();
        return res.json({ message: 'Salida registrada', tipo: 'salida' });
      } else {
        await conn.commit();
        return res.status(400).json({ error: 'Ya registró entrada y salida hoy' });
      }
    }
  } catch (error) {
    await conn.rollback();
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({ error: 'Error interno al procesar la asistencia' });
  } finally {
    conn.release();
  }
});

module.exports = router;