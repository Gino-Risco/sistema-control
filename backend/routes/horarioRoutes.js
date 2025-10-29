const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 🔹 GET /api/horarios → Obtener todos los horarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, nombre_turno, hora_entrada, hora_salida, dias_laborales, tipo, estado
      FROM horarios
      ORDER BY nombre_turno
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({ error: 'Error al obtener horarios' });
  }
});

// 🔹 POST /api/horarios → Crear un horario personalizado
router.post('/', async (req, res) => {
  const { nombre_turno, hora_entrada, hora_salida, dias_laborales = [1,2,3,4,5] } = req.body;

  if (!nombre_turno || !hora_entrada || !hora_salida) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO horarios (nombre_turno, hora_entrada, hora_salida, dias_laborales, tipo, estado)
       VALUES (?, ?, ?, ?, 'personalizado', 'activo')`,
      [nombre_turno, hora_entrada, hora_salida, JSON.stringify(dias_laborales)]
    );

    res.status(201).json({
      id: result.insertId,
      message: '✅ Horario personalizado creado correctamente'
    });
  } catch (error) {
    console.error('Error al crear horario:', error);
    res.status(500).json({ error: 'Error al crear horario' });
  }
});

module.exports = router;
