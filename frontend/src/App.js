// frontend/src/App.js
import React from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import UsuariosPage from './pages/UsuariosPage';

import DashboardPage from './pages/DashboardPage';
import WorkersPage from './pages/WorkersPage';
import AsistenciasPage from './pages/AsistenciasPage';
import AreasPage from './pages/AreasPage';
import ReportsPage from './pages/ReportsPage';
import ConfiguracionPage from './pages/ConfiguracionPage';

function App() {
  return (
    <div className="App">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />

      {/* Contenedor principal */}
      <div
        className="d-flex flex-column"
        style={{
          marginLeft: '250px', // <-- mismo ancho que el sidebar
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Navbar superior */}
        <Navbar />

        {/* Contenido dinámico */}
        <Container
          fluid
          className="p-4 flex-grow-1 bg-light"
          style={{ overflowY: 'auto', marginTop: '56px' }} // <-- espacio para el navbar
        >
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/trabajadores" element={<WorkersPage />} />
            <Route path="/asistencias" element={<AsistenciasPage />} />
            <Route path="/areas" element={<AreasPage />} />
            <Route path="/reportes" element={<ReportsPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
          </Routes>
        </Container>
      </div>
    </div>
  );
}

export default App;
