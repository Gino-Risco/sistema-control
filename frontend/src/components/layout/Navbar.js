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
      bg="white" 
      expand="lg" 
      className="shadow-sm"
      style={{ position: 'fixed', top: 0, left: '250px', right: 0, zIndex: 1020 }} 
    >
      <Container fluid className="px-4">
        <BootstrapNavbar.Brand href="/" className="fw-bold text-primary">Sistema de Control de Asistencia</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center p-0">
                <Image src={user.avatar} roundedCircle className="me-2"/>
                <span className="d-none d-md-inline text-dark">{user.name</span>
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