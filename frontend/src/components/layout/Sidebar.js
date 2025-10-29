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
import './Sidebar.css';

const SidebarLink = ({to, icon, label, isDanger = false}) => {
  const getLinkClasses = ({ isActive}) => {
    const baseClasses = "d-flex align-items-center gap-2 p-2 rounded-3 text-decoration-none mb-1";
    let textClass = "text-white-50";
    let activeBgClass = "";
    if (isDanger) {
      textClass = "text-danger";
    } else if (isActive) {
      activeBgClass = "bg-white bg-opacity-10 text-white";
    } else {
      textClass = 'text-white-50';
    }
    return [baseClasses, textClass, activeBgClass].filter(Boolean).join(" ");
  };
  return (
    <Nav.Link
      as={NavLink}
      to={to}
      end
      className={getLinkClasses}
      aria-label={label}
    >
      {icon} <span className="ms-1">{label}</span>
    </Nav.Link>
  );
};

const Sidebar = () => {
  return (
    <div
      className="d-flex flex-column p-3 bg-dark text-white"
      style={{
        width: '250px',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1030,
      }}
      role="navigation"
      aria-label="Menú de navegación principal"
    >
      {/* Logo / Título */}
      <NavLink
        to="/"
        className="d-flex align-items-center mb-4 text-white text-decoration-none"
        aria-label="Ir al inicio"
      >
        <Image
          src="/images/logo.png"
          width="40"
          height="40"
          alt="Logo de Control Asistencia"
          className="me-2"
        />
        <span className="fs-5 fw-bold">Control Asistencia</span>
      </NavLink>

      {/* Menú principal */}
      <Nav className="flex-column mb-auto">
        <SidebarLink to="/" icon={<FaHome />} label="Dashboard" />
        <SidebarLink to="/trabajadores" icon={<FaUsers />} label="Trabajadores" />
        <SidebarLink to="/asignacion-horarios" icon={<FaCalendarAlt />} label="Asignación de Horarios" />
        <SidebarLink to="/asistencias" icon={<FaCalendarCheck />} label="Asistencias" />
        <SidebarLink to="/areas" icon={<FaBuilding />} label="Áreas" />
        <SidebarLink to="/reportes" icon={<FaChartLine />} label="Reportes" />
        <SidebarLink to="/configuracion" icon={<FaCogs />} label="Configuración" />
        <SidebarLink to="/usuarios" icon={<FaUsers />} label="Usuarios" />
      </Nav>

      {/* Separador */}
      <hr className="text-secondary my-2" />

      {/* Menú de configuración y cierre de sesión */}
      <Nav className="flex-column">
        <SidebarLink to="/logout" icon={<FaSignOutAlt />} label="Cerrar sesión" isDanger />
      </Nav>
    </div>
  );
};

export default Sidebar;