// backend/routes/usuariosRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(`
      SELECT 
        u.id,
        u.usuario,
        u.estado,
        u.creado_en,
        r.nombre_rol
      FROM usuarios u
      INNER JOIN roles r ON u.id_rol = r.id
      ORDER BY u.creado_en DESC
    `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

router.post('/', async (req, res) => {
    const { usuario, id_rol, contraseña, estado = 'activo' } = req.body;

    if (!usuario || !id_rol || !contraseña) {
        return res.status(400).json({ error: 'Usuario, rol y contraseña son requeridos' });
    }

    try {
        const [existing] = await db.execute(
            `SELECT id FROM usuarios WHERE usuario = ?`,
            [usuario]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'El nombre de usuario ya existe' });
        }

        const hashedPassword = require('bcrypt').hashSync(contraseña, 10);

        const [result] = await db.execute(
            `INSERT INTO usuarios (usuario, id_rol, contraseña, estado)
       VALUES (?, ?, ?, ?)`,
            [usuario, id_rol, hashedPassword, estado]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Usuario creado exitosamente'
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error interno al crear el usuario' });
    }
});

router.patch('/:id', async (req, res) => {
    const { estado } = req.body;
    if (!estado || !['activo', 'inactivo'].includes(estado)) {
        return res.status(400).json({ error: 'Estado debe ser "activo" o "inactivo"' });
    }

    try {
        const [result] = await db.execute(
            `UPDATE usuarios SET estado = ? WHERE id = ?`,
            [estado, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.patch('/:id/editar', async (req, res) => {
    const { usuario, id_rol } = req.body;

    if (!usuario || !id_rol) {
        return res.status(400).json({ error: 'Usuario y rol son requeridos' });
    }

    try {
        const [existing] = await db.execute(
            `SELECT id FROM usuarios WHERE usuario = ? AND id != ?`,
            [usuario, req.params.id]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
        }

        const id_rol_num = parseInt(id_rol);
        if (isNaN(id_rol_num)) {
            return res.status(400).json({ error: 'ID de rol inválido' });
        }

        const [result] = await db.execute(
            `UPDATE usuarios SET usuario = ?, id_rol = ? WHERE id = ?`,
            [usuario, id_rol_num, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/:id/reset-password', async (req, res) => {
    try {
        const defaultPassword = '123456';
        const hashedPassword = require('bcrypt').hashSync(defaultPassword, 10);

        const [result] = await db.execute(
            `UPDATE usuarios SET contraseña = ? WHERE id = ?`,
            [hashedPassword, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Contraseña reseteada a "123456"' });
    } catch (error) {
        console.error('Error al resetear contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
router.get('/:id/permisos', async (req, res) => {
    try {
        const [rows] = await db.execute(`
      SELECT r.permisos
      FROM usuarios u
      INNER JOIN roles r ON u.id_rol = r.id
      WHERE u.id = ?
    `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ permisos: rows[0].permisos });
    } catch (error) {
        console.error('Error al obtener permisos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;