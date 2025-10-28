// frontend/src/components/workers/WorkerModal.js
import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import WorkerCard from './WorkerCard';

export default function WorkerModal({ show, onClose, onSave, areas }) {
  const [formData, setFormData] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    email: '',
    id_area: ''
  });
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [savedWorker, setSavedWorker] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('dni', formData.dni);
      formDataToSend.append('nombres', formData.nombres);
      formDataToSend.append('apellidos', formData.apellidos);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('id_area', formData.id_area);
      if (foto) formDataToSend.append('foto', foto);

      const response = await fetch('http://localhost:5000/api/workers', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error desconocido');
      }

      const newWorker = await response.json();
      setSavedWorker(newWorker);
      setShowCard(true);
    } catch (err) {
      alert('Error al guardar trabajador: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    alert('📧 Carné listo para enviar (simulado)');
  };

  const handleClose = () => {
    setShowCard(false);
    setSavedWorker(null);
    setFormData({
      dni: '',
      nombres: '',
      apellidos: '',
      email: '',
      id_area: ''
    });
    setFoto(null);
    setFotoPreview(null);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop="static" centered>
      {!showCard ? (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Registrar Nuevo Trabajador</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>DNI <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="dni"
                      value={formData.dni}
                      onChange={handleChange}
                      required
                      maxLength={15}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Área <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="id_area"
                      value={formData.id_area}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {areas.map(area => (
                        <option key={area.id} value={area.id}>{area.nombre_area}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombres <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellidos <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Foto (opcional)</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                    />
                    {fotoPreview && (
                      <div className="mt-2">
                        <img src={fotoPreview} alt="Vista previa" width="100" className="border rounded" />
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Trabajador'}
              </Button>
            </Modal.Footer>
          </Form>
        </>
      ) : (
        <Modal.Body>
          <WorkerCard
            worker={savedWorker}
            onPrint={handlePrint}
            onEmail={handleEmail}
          />
        </Modal.Body>
      )}
    </Modal>
  );
}