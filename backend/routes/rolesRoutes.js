// backend/routes/rolesRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/roles
 * Obtiene la lista de roles
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, nombre_rol, descripcion
      FROM roles
      ORDER BY nombre_rol
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
});

module.exports = router;