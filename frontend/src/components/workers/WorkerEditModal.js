// frontend/src/components/workers/WorkerEditModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Image } from 'react-bootstrap';
import Swal from 'sweetalert2';

export default function WorkerEditModal({ show, onClose, worker, onSave, areas }) {
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

  // Cargar datos del trabajador al abrir el modal
  useEffect(() => {
    if (worker) {
      setFormData({
        dni: worker.dni || '',
        nombres: worker.nombres || '',
        apellidos: worker.apellidos || '',
        email: worker.email || '',
        id_area: worker.id_area || ''
      });
      setFotoPreview(worker.foto ? `http://localhost:5000${worker.foto}` : null);
    }
  }, [worker]);

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

      const response = await fetch(`http://localhost:5000/api/workers/${worker.id}`, {
        method: 'PATCH',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error desconocido');
      }

      Swal.fire('¡Éxito!', 'Trabajador actualizado correctamente', 'success');
      onSave(); 
      onClose();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-primary"> Editar Trabajador</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">DNI <span className="text-danger">*</span></Form.Label>
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
                <Form.Label className="fw-bold">Área <span className="text-danger">*</span></Form.Label>
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
                <Form.Label className="fw-bold">Nombres <span className="text-danger">*</span></Form.Label>
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
                <Form.Label className="fw-bold">Apellidos <span className="text-danger">*</span></Form.Label>
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
                <Form.Label className="fw-bold">Email</Form.Label>
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
                <Form.Label className="fw-bold">Foto (opcional)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                />
                {fotoPreview && (
                  <div className="mt-2 d-flex align-items-center">
                    <Image
                      src={fotoPreview}
                      roundedCircle
                      width={80}
                      height={80}
                      className="border me-3"
                    />
                    <small className="text-muted">Vista previa</small>
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}