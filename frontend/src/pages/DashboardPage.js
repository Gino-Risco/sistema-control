// frontend/src/pages/DashboardPage.js
import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';

export default function DashboardPage() {
  return (
    <Container fluid className="p-3">
      <h2 className="mb-4">📊 Dashboard</h2>
      <Row>
        <Col md={4}>
          <Card bg="primary" text="white" className="mb-3">
            <Card.Body>
              <Card.Title>Trabajadores Activos</Card.Title>
              <Card.Text>12</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card bg="success" text="white" className="mb-3">
            <Card.Body>
              <Card.Title>Hoy Puntuales</Card.Title>
              <Card.Text>8</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card bg="warning" text="dark" className="mb-3">
            <Card.Body>
              <Card.Title>Tardanzas Hoy</Card.Title>
              <Card.Text>4</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="mt-4">
        <Card.Header>Bienvenido al sistema de control de asistencia</Card.Header>
        <Card.Body>
          <p>Desde aquí puedes gestionar trabajadores, registrar asistencias, generar reportes y configurar el sistema.</p>
        </Card.Body>
      </Card>
    </Container>
  );
}