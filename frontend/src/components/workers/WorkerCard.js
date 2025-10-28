import React from 'react';
import { Card, Container, Row, Col, Button, Image } from 'react-bootstrap';
import { FaPrint, FaEnvelope, FaArrowLeft } from 'react-icons/fa';

export default function WorkerCard({ worker, onPrint, onEmail, onBack }) {
  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '85vh' }}
    >
      <Card
        className="shadow-lg border rounded"
        style={{
          width: '320px',
          height: '500px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #007bff 30%, #ffffff 30%)'
        }}
      >
        {/* Header azul */}
        <div
          className="text-center text-white py-2"
          style={{
            backgroundColor: 'rgba(0,0,0,0.1)',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}
        >
          CONTROL DE ASISTENCIA
        </div>

        {/* Contenido */}
        <Card.Body className="text-center mt-3">
          {/* Foto */}
          <img
            src={worker.foto ? `http://localhost:5000${worker.foto}` : 'https://via.placeholder.com/150?text=Avatar'}
            alt="Foto del trabajador"
            width={100}
            height={100}
            className="border"
            onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Avatar'}
          />

          {/* Datos */}
          <h6 className="mt-2 mb-0 fw-bold text-uppercase">
            {worker.nombres} {worker.apellidos}
          </h6>
          <p className="mb-1 text-muted" style={{ fontSize: '0.9rem' }}>
            DNI: {worker.dni}
          </p>
          <p className="mb-2" style={{ fontSize: '0.9rem' }}>
            Área: <strong>{worker.area || worker.nombre_area}</strong>
          </p>

          {/* QR grande */}
          <div
            className="d-flex justify-content-center align-items-center bg-light border rounded mx-auto mt-3"
            style={{
              width: '180px',
              height: '180px',
              padding: '10px'
            }}
          >
            <Image
              src={worker.qrImage || 'https://via.placeholder.com/150?text=QR'}
              alt="Código QR"
              width={160}
              height={160}
              className="border p-1 rounded"
            />
          </div>

          <small className="text-muted d-block mt-2">
            Escanee este código para validar su asistencia
          </small>
        </Card.Body>

        {/* Footer con botones */}
        <Card.Footer
          className="text-center d-flex justify-content-around bg-white border-top"
          style={{ position: 'absolute', bottom: 0, width: '100%' }}
        >
          <Button variant="outline-secondary" size="sm" onClick={onBack}>
            <FaArrowLeft /> Volver
          </Button>
          <Button variant="outline-primary" size="sm" onClick={onPrint}>
            <FaPrint /> Imprimir
          </Button>
          <Button variant="outline-success" size="sm" onClick={onEmail}>
            <FaEnvelope /> Correo
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}
