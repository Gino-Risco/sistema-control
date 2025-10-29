// frontend/src/pages/UsuariosPage.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Modal, Badge } from 'react-bootstrap';
import { FaUserPlus, FaCheckCircle, FaTimesCircle, FaEdit, FaKey, FaEye } from 'react-icons/fa';
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

    
    const handleEdit = (user) => {
        setEditingUser({
            id: user.id,
            usuario: user.usuario,
            id_rol: user.id_rol || user.nombre_rol 
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
        <Container fluid className="p-4" style={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
            <Card className="shadow-lg border-0 rounded-4">
                <Card.Header
                    className="d-flex justify-content-between align-items-center py-3 px-4"
                    style={{
                        background: "linear-gradient(90deg, #2235e0ff, #48647eff)",
                        color: "white",
                        borderTopLeftRadius: "1rem",
                        borderTopRightRadius: "1rem"
                    }}
                >
                    <h4 className="m-0 fw-bold d-flex align-items-center gap-2">👥 Gestión de Usuarios</h4>

                    <Button
                        className="d-flex align-items-center gap-2 px-3 py-2 fw-semibold shadow-sm"
                        onClick={() => setShowModal(true)}
                        style={{
                            backgroundColor: "white",
                            color: "#1474d4ff",
                            border: "none",
                            borderRadius: "50px",
                            transition: "all 0.15s ease"
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f3f6f7ff")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
                    >
                        <FaUserPlus />
                        Nuevo Usuario
                    </Button>
                </Card.Header>

                <Card.Body className="p-4">
                    <div className="table-responsive">
                        <Table hover className="align-middle text-center">
                            <thead className="table-light">
                                <tr>
                                    <th>👤 Usuario</th>
                                    <th>🛠 Rol</th>
                                    <th>📡 Estado</th>
                                    <th>⚙ Opciones</th>
                                </tr>
                            </thead>


                            <tbody>
                                {usuarios.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-muted py-4">No hay usuarios registrados</td>
                                    </tr>
                                ) : (
                                    usuarios.map((u) => (
                                        <tr key={u.id} className="hover-row">
                                            <td className="fw-semibold text-center align-middle">{u.usuario}</td>

                                            <td className="text-center align-middle">
                                                <Badge bg="secondary" className="px-3 py-2 rounded-pill">
                                                    {u.nombre_rol}
                                                </Badge>
                                            </td>

                                            {/*  Celda de estado perfectamente centrada */}
                                            <td className="text-center align-middle">
                                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => toggleEstado(u.id, u.estado)}
                                                        style={{
                                                            backgroundColor: u.estado === "activo" ? "#2aa2ceff" : "#d84444ff",
                                                            border: "none",
                                                            color: "white",
                                                            fontWeight: 500,
                                                            borderRadius: "8px",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            gap: "8px",
                                                            width: "120px",
                                                            height: "36px",
                                                            padding: "0 12px",
                                                        }}
                                                    >
                                                        {u.estado === "activo" ? (
                                                            <>
                                                                <FaCheckCircle />
                                                                <span>Activo</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaTimesCircle />
                                                                <span>Inactivo</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </td>

                                            {/* Opciones - botones cuadrados */}
                                            <td className="text-center align-middle">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline-warning"
                                                        title="Editar"
                                                        onClick={() => handleEdit(u)}
                                                        style={{ borderRadius: "4px", width: "40px", height: "36px", padding: 0 }}
                                                    >
                                                        <FaEdit />
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline-info"
                                                        title="Restablecer Clave"
                                                        onClick={() => handleResetPassword(u.id)}
                                                        style={{ borderRadius: "4px", width: "40px", height: "36px", padding: 0 }}
                                                    >
                                                        <FaKey />
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline-primary"
                                                        title="Ver Permisos"
                                                        onClick={() => handleVerPermisos(u.id)}
                                                        style={{ borderRadius: "4px", width: "40px", height: "36px", padding: 0 }}
                                                    >
                                                        <FaEye />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* --- Modal Crear --- */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered dialogClassName="rounded-4">
                <Modal.Header closeButton className="rounded-top-4">
                    <Modal.Title>🆕 Crear Nuevo Usuario</Modal.Title>
                </Modal.Header>

                <Modal.Body className="bg-light rounded-bottom-4">
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Usuario *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.usuario}
                                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Contraseña *</Form.Label>
                            <Form.Control
                                type="password"
                                value={formData.contraseña}
                                onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Rol *</Form.Label>
                            <Form.Select value={formData.id_rol} onChange={(e) => setFormData({ ...formData, id_rol: e.target.value })}>
                                <option value="">Seleccionar...</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>{r.nombre_rol}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer className="rounded-bottom-4">
                    <Button variant="secondary" onClick={() => setShowModal(false)} style={{ borderRadius: "6px" }}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={handleSave} style={{ backgroundColor: "#1e9e49", border: "none", borderRadius: "6px" }}>
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* --- Modal Editar --- */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered dialogClassName="rounded-4">
                <Modal.Header closeButton className="rounded-top-4">
                    <Modal.Title>✏️ Editar Usuario</Modal.Title>
                </Modal.Header>

                <Modal.Body className="bg-light rounded-bottom-4">
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Usuario *</Form.Label>
                            <Form.Control
                                type="text"
                                value={editingUser?.usuario || ""}
                                onChange={(e) => setEditingUser({ ...editingUser, usuario: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Rol *</Form.Label>
                            <Form.Select value={editingUser?.id_rol || ""} onChange={(e) => setEditingUser({ ...editingUser, id_rol: e.target.value })}>
                                <option value="">Seleccionar...</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>{r.nombre_rol}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer className="rounded-bottom-4">
                    <Button variant="secondary" onClick={() => setShowEditModal(false)} style={{ borderRadius: "6px" }}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={handleSaveEdit} style={{ backgroundColor: "#1e9e49", border: "none", borderRadius: "6px" }}>
                        Guardar Cambios
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* --- Modal Permisos --- */}
            <Modal show={showPermisosModal} onHide={() => setShowPermisosModal(false)} centered size="md">
                <Modal.Header closeButton>
                    <Modal.Title>🔐 Permisos del Rol</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {permisos && typeof permisos === "object" ? (
                        <div>
                            {Object.keys(permisos).map((modulo) => {
                                const acciones = Array.isArray(permisos[modulo])
                                    ? permisos[modulo]
                                    : [permisos[modulo]];
                                return (
                                    <div key={modulo} className="mb-3">
                                        <strong>{modulo}:</strong>
                                        <ul className="mt-1 mb-0">
                                            {acciones.map((accion, index) => (
                                                <li key={index}>{accion}</li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-muted">No hay permisos disponibles</p>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPermisosModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
}