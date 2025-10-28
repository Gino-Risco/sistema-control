// backend/routes/workerRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { generateQrBase64 } = require('../utils/qrCodeGenerator');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'foto-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        t.id,
        t.dni,
        t.nombres,
        t.apellidos,
        t.email,
        t.foto,
        t.codigo_qr,
        t.estado,
        a.nombre_area
      FROM trabajadores t
      INNER JOIN areas a ON t.id_area = a.id
      ORDER BY t.nombres
    `);

    const workersWithQr = await Promise.all(rows.map(async (w) => {
      if (w.codigo_qr) {
        w.qrImage = await generateQrBase64(w.codigo_qr);
      }
      return w;
    }));

    res.json(workersWithQr);
  } catch (error) {
    console.error('Error en GET /api/workers:', error);
    res.status(500).json({ error: 'Error al obtener trabajadores' });
  }
});

router.post('/', upload.single('foto'), async (req, res) => {
  const { dni, nombres, apellidos, email, id_area } = req.body;

  if (!dni || !nombres || !apellidos || !id_area) {
    return res.status(400).json({ error: 'DNI, nombres, apellidos y área son requeridos' });
  }

  const foto = req.file ? `/uploads/${req.file.filename}` : null;
  const codigo_qr = `QR-${dni}-${Date.now()}`;
  const qrImage = await generateQrBase64(codigo_qr);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `INSERT INTO trabajadores (dni, nombres, apellidos, email, id_area, foto, codigo_qr, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [dni, nombres, apellidos, email, id_area, foto, codigo_qr]
    );

    await conn.commit();
    res.status(201).json({
      id: result.insertId,
      dni,
      nombres,
      apellidos,
      email,
      foto,
      codigo_qr,
      qrImage,
      message: 'Trabajador registrado exitosamente'
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error en createWorker:', error);
    res.status(500).json({ error: 'Error al registrar trabajador' });
  } finally {
    conn.release();
  }
});

router.patch('/:id/estado', async (req, res) => {
  const { estado } = req.body;

  if (!estado || !['activo', 'inactivo'].includes(estado)) {
    return res.status(400).json({ error: 'Estado debe ser "activo" o "inactivo"' });
  }

  try {
    const [result] = await db.execute(
      `UPDATE trabajadores SET estado = ? WHERE id = ?`,
      [estado, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    res.json({ message: `Trabajador ${estado} correctamente` });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;