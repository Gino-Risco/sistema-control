// backend/routes/asignacionHorariosRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * PATCH /api/asignacion-horarios/:trabajador_id
 * Asigna un horario a un trabajador
 */
router.patch('/:trabajador_id', async (req, res) => {
  const { id_horario } = req.body;
  const trabajadorId = req.params.trabajador_id;

  if (!id_horario) {
    return res.status(400).json({ error: 'El campo "id_horario" es requerido' });
  }

  try {
    // Verificar que el horario exista
    const [horarios] = await db.execute(
      `SELECT id FROM horarios WHERE id = ? AND estado = 'activo'`,
      [id_horario]
    );
    if (horarios.length === 0) {
      return res.status(404).json({ error: 'Horario no encontrado o inactivo' });
    }

    // Verificar que el trabajador exista
    const [trabajadores] = await db.execute(
      `SELECT id FROM trabajadores WHERE id = ? AND estado = 'activo'`,
      [trabajadorId]
    );
    if (trabajadores.length === 0) {
      return res.status(404).json({ error: 'Trabajador no encontrado o inactivo' });
    }

    // Asignar horario
    const [result] = await db.execute(
      `UPDATE trabajadores SET id_horario = ? WHERE id = ?`,
      [id_horario, trabajadorId]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: 'No se pudo actualizar el horario' });
    }

    res.json({ message: 'Horario asignado correctamente' });
  } catch (error) {
    console.error('Error al asignar horario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;