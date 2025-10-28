const db = require('../config/database');
const { generateQrBase64 } = require('../utils/qrCodeGenerator');

const getAllWorkers = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT t.id, t.dni, t.nombres, t.apellidos, t.email, t.codigo_qr,
             t.horario_entrada, t.horario_salida, t.estado, t.foto,
             a.nombre_area
      FROM trabajadores t
      INNER JOIN areas a ON t.id_area = a.id
      WHERE t.estado IN ('activo', 'inactivo')
      ORDER BY t.nombres
    `);

    // Agregar QR como base64 (solo si existe código QR)
    const workersWithQr = await Promise.all(rows.map(async (w) => {
      if (w.codigo_qr) {
        w.qrImage = await generateQrBase64(w.codigo_qr);
      }
      return w;
    }));

    res.json(workersWithQr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const createWorker = async (req, res) => {
  const { dni, nombres, apellidos, email, id_area, horario_entrada = '08:00:00', horario_salida = '17:00:00' } = req.body;

  if (!dni || !nombres || !apellidos || !id_area) {
    return res.status(400).json({ error: 'DNI, nombres, apellidos y área son requeridos' });
  }

  const codigo_qr = `QR-${dni}-${Date.now()}`;
  const qrImage = await generateQrBase64(codigo_qr);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `INSERT INTO trabajadores (dni, nombres, apellidos, email, id_area, codigo_qr, horario_entrada, horario_salida, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [dni, nombres, apellidos, email, id_area, codigo_qr, horario_entrada, horario_salida]
    );

    // Obtener el trabajador recién creado con su área
    const [workerRows] = await conn.execute(`
      SELECT t.*, a.nombre_area 
      FROM trabajadores t
      INNER JOIN areas a ON t.id_area = a.id
      WHERE t.id = ?
    `, [result.insertId]);

    const worker = workerRows[0];
    worker.qrImage = qrImage; // Agregar QR

    await conn.commit();

    res.status(201).json({
      id: worker.id,
      dni: worker.dni,
      nombres: worker.nombres,
      apellidos: worker.apellidos,
      email: worker.email,
      area: worker.nombre_area,
      codigo_qr: worker.codigo_qr,
      qrImage: worker.qrImage,
      foto: worker.foto || 'https://via.placeholder.com/150?text=Avatar', // Avatar por defecto
      message: 'Trabajador registrado exitosamente'
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error en createWorker:', error);
    res.status(500).json({ error: 'Error al registrar trabajador' });
  } finally {
    conn.release();
  }
};

module.exports = { getAllWorkers, createWorker };