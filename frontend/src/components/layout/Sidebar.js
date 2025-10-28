import React from 'react';
import { Nav, Image } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaCalendarCheck,
  FaBuilding,
  FaChartLine,
  FaCogs,
  FaSignOutAlt
} from 'react-icons/fa';

export default function Sidebar() {
  return (
    <div
      className="d-flex flex-column p-3 bg-dark text-white"
      style={{
        width: '250px',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo / Título */}
      <div className="text-center mb-4">
        <Image src="https://via.placeholder.com/60?text=LOGO" roundedCircle />
        <h5 className="mt-2">Control de Asistencia</h5>
      </div>

      {/* Menú lateral */}
      <Nav className="flex-column">
        <SidebarLink to="/" icon={<FaHome />} label="Dashboard" />
        <SidebarLink to="/trabajadores" icon={<FaUsers />} label="Trabajadores" />
        <SidebarLink to="/asistencias" icon={<FaCalendarCheck />} label="Asistencias" />
        <SidebarLink to="/areas" icon={<FaBuilding />} label="Áreas" />
        <SidebarLink to="/reportes" icon={<FaChartLine />} label="Reportes" />
        <SidebarLink to="/usuarios" icon={<FaUsers />} label="Usuarios" />
        <SidebarLink to="/configuracion" icon={<FaCogs />} label="Configuración" />
        <hr />
        <SidebarLink to="#" icon={<FaSignOutAlt />} label="Cerrar sesión" textColor="text-danger" />
      </Nav>
    </div>
  );
}

/* 🔹 Componente pequeño para cada enlace con estilo dinámico */
function SidebarLink({ to, icon, label, textColor = "text-light" }) {
  return (
    <Nav.Link
      as={NavLink}
      to={to}
      end
      className={`mb-2 ${textColor}`}
      style={({ isActive }) => ({
        backgroundColor: isActive ? '#0d6efd' : 'transparent', // azul Bootstrap
        color: isActive ? 'white' : 'lightgray',
        borderRadius: '8px',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        fontWeight: isActive ? 'bold' : 'normal',
        transition: 'all 0.2s ease',
      })}
    >
      {icon} {label}
    </Nav.Link>
  );
}
