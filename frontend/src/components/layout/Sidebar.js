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
  FaCalendarAlt,
  FaSignOutAlt
} from 'react-icons/fa';

export default function Sidebar() {
  return (
    <div
      className="d-flex flex-column p-3 bg-dark text-white"
      style={{ width: '250px', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1030,
      }}
    >
      {/* Logo / Título */}
      <NavLink to="/" className="d-flex align-items-center mb-4 text-white text-decoration-none">
        <Image src="/images/logo.png" width="40" height="40" alt="Logo" className="me-2"/>
        <span className="fs-5 fw-bold">Control Asistencia</span>
      </NavLink>

      {/* Menú lateral */}
      <Nav variant="pills" className="flex-column mb-auto">
        <SidebarLink to="/" icon={<FaHome />} label="Dashboard" />
        <SidebarLink to="/trabajadores" icon={<FaUsers />} label="Trabajadores" />
        <SidebarLink to="/asignacion-horarios" icon={<FaCalendarAlt />} label="Asignación de Horarios" />
        <SidebarLink to="/asistencias" icon={<FaCalendarCheck />} label="Asistencias" />
        <SidebarLink to="/areas" icon={<FaBuilding />} label="Áreas" />
        <SidebarLink to="/reportes" icon={<FaChartLine />} label="Reportes" />
      </Nav>

      {/* Footer del Sidebar */}
      <hr className="text-secondary"/>
      <Nav variant="pills" className="flex-column">
        <SidebarLink to="/configuracion" icon={<FaCogs />} label="Configuración" />
        <SidebarLink to="/usuarios" icon={<FaUsers />} label="Usuarios" />
        <SidebarLink to="/logout" icon={<FaSignOutAlt />} label="Cerrar sesión" isDanger={true} />
      </Nav>
    </div>
  );
}

function SidebarLink({ to, icon, label, isDanger = false }) {
  const baseClasses = "d-flex align-items-center gap-2 p-2 rounded-3 text-decoration-none";
  const dangerClasses = "text-danger hover-bg-danger";
  const normalClasses = "text-white-50 hover-bg-primary";
  return (
    <Nav.Link
      as={NavLink}
      to={to}
      end
      className={({ isActive }) =>
        [
          baseClasses,
          "mb-1",
          isActive && !isDanger ? "bg-primary text-white" : "",
          isDanger ? dangerClasses : normalClasses,
        ]
        .filter(Boolean)
        .join(" ")
      }
    >
      {icon} {label}
    </Nav.Link>
  );

}
