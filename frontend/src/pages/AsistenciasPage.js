// frontend/src/pages/AsistenciasPage.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Button,
  Table,
  Form,
  Row,
  Col,
  Spinner
} from 'react-bootstrap';

export default function AsistenciasPage() {
  const [fechaInicio, setFechaInicio] = useState(() => {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return primerDia.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  });
  const [dniBusqueda, setDniBusqueda] = useState('');

  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar asistencias
  const fetchAsistencias = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('http://localhost:5000/api/asistencia');
      if (fechaInicio) url.searchParams.append('fecha_inicio', fechaInicio);
      if (fechaFin) url.searchParams.append('fecha_fin', fechaFin);
      if (dniBusqueda) url.searchParams.append('dni', dniBusqueda);

      const response = await fetch(url);
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      const data = await response.json();
      setAsistencias(data);
    } catch (err) {
      setError('Error al cargar los registros de asistencia');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsistencias();
  }, []);

  // Renderizar estado con colores
  const renderEstado = (estado) => {
    const config = {
      puntual: { variant: 'success', label: 'Puntual' },
      tardanza: { variant: 'warning', label: 'Tardanza' },
      ausente: { variant: 'danger', label: 'Ausente' },
      justificado: { variant: 'info', label: 'Justificado' }
    };
    const { variant, label } = config[estado] || { variant: 'secondary', label: estado };
    return <span className={`badge bg-${variant}`}>{label}</span>;
  };

  return (
    <Container fluid className="p-3">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">📋 Registro de Asistencias</h4>
        </Card.Header>
        <Card.Body>
          {/* Filtros */}
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              fetchAsistencias();
            }}
            className="mb-4"
          >
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Fecha Inicio</Form.Label>
                  <Form.Control
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Fecha Fin</Form.Label>
                  <Form.Control
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Buscar por DNI</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej. 75123456"
                    value={dniBusqueda}
                    onChange={(e) => setDniBusqueda(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button variant="outline-primary" type="submit" className="me-2">
                  Filtrar
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    const hoy = new Date();
                    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                    setFechaInicio(primerDia.toISOString().split('T')[0]);
                    setFechaFin(hoy.toISOString().split('T')[0]);
                    setDniBusqueda('');
                    fetchAsistencias();
                  }}
                >
                  Limpiar
                </Button>
              </Col>
            </Row>
          </Form>

          {/* Tabla */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando registros...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Trabajador</th>
                  <th>DNI</th>
                  <th>Horario</th> {/* ← Nuevo campo */}
                  <th>Hora Entrada</th>
                  <th>Hora Salida</th>
                  <th>Tardanza (min)</th>
                  <th>Estado</th>
                  <th>Método</th>
                </tr>
              </thead>
              <tbody>
                {asistencias.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">No se encontraron registros</td>
                  </tr>
                ) : (
                  asistencias.map((asistencia) => (
                    <tr key={asistencia.id}>
                      <td>{asistencia.fecha}</td>
                      <td>{asistencia.nombre_completo}</td>
                      <td>{asistencia.dni}</td>
                      <td>{asistencia.horario || '—'}</td> {/* ← Muestra el nombre del horario */}
                      <td>{asistencia.hora_entrada || '—'}</td>
                      <td>{asistencia.hora_salida || '—'}</td>
                      <td>{asistencia.minutos_tardanza || 0}</td>
                      <td>{renderEstado(asistencia.estado)}</td>
                      <td>
                        <span
                          className={`badge bg-${asistencia.metodo_registro === 'qr' ? 'info' : 'secondary'}`}
                        >
                          {asistencia.metodo_registro === 'qr' ? 'QR' : 'Manual'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}