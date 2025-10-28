import React from "react";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="d-flex">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />

      {/* Contenido principal */}
      <main
        className="flex-grow-1 bg-light p-4"
        style={{
          marginLeft: "250px", // espacio igual al ancho del sidebar
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
