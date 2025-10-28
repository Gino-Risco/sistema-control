// frontend/src/pages/UsuariosPage.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Modal } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPermisosModal, setShowPermisosModal] = useState(false);
    const [formData, setFormData] = useState({
        usuario: '',
        contraseña: '',
        id_rol: ''
    });
    const [editingUser, setEditingUser] = useState(null);
    const [permisos, setPermisos] = useState({});

    // Cargar usuarios
    const loadUsuarios = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/usuarios');
            const data = await res.json();
            setUsuarios(data);
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
            Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
        }
    };

    // Cargar roles
    const loadRoles = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/roles');
            const data = await res.json();
            setRoles(data);
        } catch (err) {
            console.error('Error al cargar roles:', err);
        }
    };

    useEffect(() => {
        loadUsuarios();
        loadRoles();
    }, []);

    // Cambiar estado con confirmación
    const toggleEstado = async (id, estadoActual) => {
        const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
        const action = nuevoEstado === 'activo' ? 'activar' : 'desactivar';

        const result = await Swal.fire({
            title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
            text: `El usuario será ${nuevoEstado}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: `Sí, ${action}`,
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido');
            }

            setUsuarios(prev =>
                prev.map(u => (u.id === id ? { ...u, estado: nuevoEstado } : u))
            );

            Swal.fire('¡Éxito!', `Usuario ${nuevoEstado} correctamente`, 'success');
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    // Guardar nuevo usuario
    const handleSave = async () => {
        if (!formData.usuario || !formData.contraseña || !formData.id_rol) {
            Swal.fire('Error', 'Todos los campos son requeridos', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido');
            }

            Swal.fire('¡Éxito!', 'Usuario creado exitosamente', 'success');
            loadUsuarios();
            setShowModal(false);
            setFormData({ usuario: '', contraseña: '', id_rol: '' });
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    // Abrir modal de edición
    const handleEdit = (user) => {
        setEditingUser({
            id: user.id,
            usuario: user.usuario,
            id_rol: user.id_rol || user.nombre_rol // Asegura que id_rol esté disponible
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingUser.usuario || !editingUser.id_rol) {
            Swal.fire('Error', 'Usuario y rol son requeridos', 'error');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/usuarios/${editingUser.id}/editar`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario: editingUser.usuario,
                    id_rol: parseInt(editingUser.id_rol)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido');
            }

            Swal.fire('¡Éxito!', 'Usuario actualizado correctamente', 'success');
            loadUsuarios();
            setShowEditModal(false);
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    // Resetear contraseña
    const handleResetPassword = async (id) => {
        const result = await Swal.fire({
            title: '¿Resetear contraseña?',
            text: 'La contraseña se cambiará a "123456"',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, resetear',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/api/usuarios/${id}/reset-password`, {
                method: 'POST'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido');
            }

            Swal.fire('¡Éxito!', 'Contraseña reseteada a "123456"', 'success');
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const handleVerPermisos = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/usuarios/${id}/permisos`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido');
            }
            const data = await response.json();

            // Parsear permisos si es un string
            let permisosParsed = data.permisos;
            if (typeof data.permisos === 'string') {
                permisosParsed = JSON.parse(data.permisos);
            }

            setPermisos(permisosParsed);
            setShowPermisosModal(true);
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    return (
        <Container fluid className="p-3">
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h4>👥 Gestión de Usuarios</h4>
                    <Button variant="success" onClick={() => setShowModal(true)}>
                        + Nuevo Usuario
                    </Button>
                </Card.Header>
                <Card.Body>
                    <Table striped hover responsive>
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center">No hay usuarios registrados</td>
                                </tr>
                            ) : (
                                usuarios.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.usuario}</td>
                                        <td>{u.nombre_rol}</td>
                                        <td className="text-center">
                                            <Button
                                                size="sm"
                                                style={{
                                                    backgroundColor: u.estado === 'activo' ? '#28a745' : '#dc3545',
                                                    border: 'none',
                                                    color: 'white',
                                                    fontWeight: '500',
                                                    width: '90px',
                                                    padding: '4px 8px',
                                                    fontSize: '0.85rem',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '5px',
                                                    lineHeight: '1.2',
                                                    transition: 'background-color 0.3s ease' // 🔹 transición suave
                                                }}
                                                onClick={() => toggleEstado(u.id, u.estado)}
                                            >
                                                {u.estado === 'activo' ? (
                                                    <>
                                                        <FaCheckCircle size={14} />
                                                        <span>Activo</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaTimesCircle size={14} />
                                                        <span>Inactivo</span>
                                                    </>
                                                )}
                                            </Button>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline-warning"
                                                    title="Editar"
                                                    onClick={() => handleEdit(u)}
                                                >
                                                    ✏️
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-info"
                                                    title="Reset clave"
                                                    onClick={() => handleResetPassword(u.id)}
                                                >
                                                    🔑
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    title="Ver permisos"
                                                    onClick={() => handleVerPermisos(u.id)}
                                                >
                                                    👁️
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Modal para nuevo usuario */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Nuevo Usuario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Usuario *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.usuario}
                                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Contraseña *</Form.Label>
                            <Form.Control
                                type="password"
                                value={formData.contraseña}
                                onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Rol *</Form.Label>
                            <Form.Select
                                value={formData.id_rol}
                                onChange={(e) => setFormData({ ...formData, id_rol: e.target.value })}
                                required
                            >
                                <option value="">Seleccionar...</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.nombre_rol}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSave}>Guardar</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de edición */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Usuario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Usuario *</Form.Label>
                            <Form.Control
                                type="text"
                                value={editingUser?.usuario || ''}
                                onChange={(e) => setEditingUser({ ...editingUser, usuario: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Rol *</Form.Label>
                            <Form.Select
                                value={editingUser?.id_rol || ''}
                                onChange={(e) => setEditingUser({ ...editingUser, id_rol: e.target.value })}
                                required
                            >
                                <option value="">Seleccionar...</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.nombre_rol}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSaveEdit}>Guardar Cambios</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de permisos */}
            <Modal show={showPermisosModal} onHide={() => setShowPermisosModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Permisos del Rol</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {permisos && typeof permisos === 'object' ? (
                        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                            <h6>🔹 Permisos:</h6>
                            {Object.keys(permisos).map((modulo) => {
                                const acciones = permisos[modulo];
                                // Asegurarse de que acciones sea un array
                                const accionesArray = Array.isArray(acciones) ? acciones : [acciones];

                                return (
                                    <div key={modulo} className="mb-2">
                                        <strong>{modulo}:</strong>
                                        <ul className="mt-1 mb-0">
                                            {accionesArray.map((accion, index) => (
                                                <li key={index}>{accion}</li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div>No hay permisos disponibles</div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPermisosModal(false)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}