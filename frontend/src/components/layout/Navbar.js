// frontend/src/components/layout/Navbar.js
import React from 'react';
import { Navbar as BootstrapNavbar, Container, Nav, Dropdown, Image } from 'react-bootstrap';
import { FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';

export default function Navbar() {
  const user = {
    name: 'Usuario Admin',
    avatar: 'https://via.placeholder.com/40' // se puede reemplazar con la foto real del usuario
  }
  return (
    <BootstrapNavbar 
      bg="light" 
      expand="lg" 
      className="shadow-sm"
      style={{ position: 'fixed', top: 0, left: '250px', right: 0, zIndex: 1000 }} // ← Ajuste clave
    >
      <Container>
        <BootstrapNavbar.Brand href="#home">Sistema de Control de Asistencia</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                <FaUser /> Usuario
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="#profile">Perfil</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item href="#logout" className="text-danger">Cerrar sesión</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}