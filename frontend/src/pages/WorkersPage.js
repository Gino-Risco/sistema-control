// frontend/src/pages/WorkersPage.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Table, Image } from 'react-bootstrap';
import Swal from 'sweetalert2';
import WorkerModal from '../components/workers/WorkerModal';
import WorkerEditModal from '../components/workers/WorkerEditModal';
import WorkerCard from '../components/workers/WorkerCard';
import 'bootstrap-icons/font/bootstrap-icons.css';

import workerApi from '../api/workerApi';

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);

  const loadWorkers = async () => {
    try {
      const [workersRes, areasRes] = await Promise.all([
        workerApi.get('/'),
        Promise.resolve({
          data: [
            { id: 1, nombre_area: 'Producción' },
            { id: 2, nombre_area: 'Logística' },
            { id: 3, nombre_area: 'Administración' },
            { id: 4, nombre_area: 'Recursos Humanos' }
          ]
        })
      ]);
      setWorkers(workersRes.data);
      setAreas(areasRes.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

 
  const toggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    const action = nuevoEstado === 'activo' ? 'activar' : 'inactivar';

    const result = await Swal.fire({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} trabajador?`,
      text: `El trabajador será ${nuevoEstado}. ${nuevoEstado === 'inactivo' ? 'No podrá registrar asistencia.' : ''}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`http://localhost:5000/api/workers/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      Swal.fire('¡Éxito!', `Trabajador ${nuevoEstado} correctamente`, 'success');
      loadWorkers();
    } catch (err) {
      Swal.fire('Error', 'Error al cambiar estado del trabajador', 'error');
    }
  };

  const handleSaveWorker = async (data) => {
    try {
      const res = await workerApi.post('/', data);
      const newWorker = res.data;
      setSelectedWorker(newWorker);
      loadWorkers();
      setShowModal(false);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || err.message, 'error');
    }
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setShowEditModal(true);
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  return (
    <Container fluid className="py-4">
      {selectedWorker ? (
        <WorkerCard
          worker={selectedWorker}
          onPrint={() => window.print()}
          onEmail={() =>
            Swal.fire('Info', 'Función de envío por correo no implementada', 'info')
          }
          onBack={() => setSelectedWorker(null)}
        />
      ) : (
        <>
          <Card className="shadow border-0 rounded-4">
            <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white rounded-top-4">
              <h4 className="mb-0">Gestión de Trabajadores</h4>
              <Button
                variant="primary"
                className="d-flex align-items-center gap-2 shadow-sm px-3 py-2 rounded-pill fw-semibold"
                onClick={() => setShowModal(true)}
                style={{
                  background: 'linear-gradient(90deg, #179240ff, #15ac72ff)',
                  border: 'none',
                }}
              >
                <i className="bi bi-person-plus-fill"></i>
                Nuevo Trabajador
              </Button>


            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">Cargando...</div>
              ) : (
                <Table responsive hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Foto</th>
                      <th>DNI</th>
                      <th>Nombre Completo</th>
                      <th>Área</th>
                      <th>Código QR</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No hay trabajadores
                        </td>
                      </tr>
                    ) : (
                      workers.map((worker) => (
                        <tr key={worker.id}>
                          <td>
                            <Image
                              src={
                                worker.foto
                                  ? `http://localhost:5000${worker.foto.startsWith('/')
                                    ? worker.foto
                                    : '/' + worker.foto
                                  }`
                                  : 'https://via.placeholder.com/50?text=Avatar'
                              }
                              roundedCircle
                              width={50}
                              height={50}
                              className="border"
                            />
                          </td>

                          <td>{worker.dni}</td>
                          <td>
                            {worker.nombres} {worker.apellidos}
                          </td>
                          <td>{worker.nombre_area}</td>
                          <td>
                            {worker.qrImage ? (
                              <img
                                src={worker.qrImage}
                                alt="QR"
                                width="70"
                                className="border p-1 rounded"
                              />
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            <Button
                              size="sm"
                              style={{
                                backgroundColor:
                                  worker.estado === 'activo'
                                    ? '#28a745'
                                    : '#dc3545',
                                border: 'none',
                                color: 'white',
                                fontWeight: '500',
                                width: '90px',
                                borderRadius: '12px',
                                transition: 'background-color 0.3s ease'
                              }}
                              onClick={() =>
                                toggleEstado(worker.id, worker.estado)
                              }
                            >
                              {worker.estado === 'activo'
                                ? 'Activo'
                                : 'Inactivo'}
                            </Button>
                          </td>

                          <td>
                            <Button
                              size="sm"
                              variant="info"
                              className="me-2"
                              onClick={() => setSelectedWorker(worker)}
                            >
                              Ver Carnet
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleEdit(worker)}
                            >
                              ✏️ Editar
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          {/*  Modal de nuevo trabajador */}
          <WorkerModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveWorker}
            areas={areas}
          />

          {/*  Modal de edición */}
          <WorkerEditModal
            show={showEditModal}
            onClose={() => setShowEditModal(false)}
            worker={editingWorker}
            onSave={loadWorkers}
            areas={areas}
          />
        </>
      )}
    </Container>
  );
}
