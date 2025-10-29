// frontend/src/pages/AsignacionHorariosPage.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Button } from 'react-bootstrap';
import Select from 'react-select'; 

export default function AsignacionHorariosPage() {
    const [trabajadorId, setTrabajadorId] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [turnoSeleccionado, setTurnoSeleccionado] = useState('');
    const [horaEntrada, setHoraEntrada] = useState('08:00');
    const [horaSalida, setHoraSalida] = useState('17:00');
    const [diasLaborales, setDiasLaborales] = useState([1, 2, 3, 4, 5]);
    const [trabajadores, setTrabajadores] = useState([]);
    const [horariosPredefinidos, setHorariosPredefinidos] = useState([]);
    const [mes, setMes] = useState(() => {
        const hoy = new Date();
        return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
    });

    const loadData = async () => {
        try {
            const [trabRes, horRes] = await Promise.all([
                fetch('http://localhost:5000/api/workers'),
                fetch('http://localhost:5000/api/horarios')
            ]);

            if (!trabRes.ok || !horRes.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const trabData = await trabRes.json();
            const horData = await horRes.json();

            setTrabajadores(Array.isArray(trabData) ? trabData : []);
            setHorariosPredefinidos(
                Array.isArray(horData)
                    ? horData.filter(h => h.tipo === 'predefinido' && h.estado === 'activo')
                    : []
            );
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setTrabajadores([]);
            setHorariosPredefinidos([]);
            alert('No se pudieron cargar los datos.');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleTurnoChange = (e) => {
        const nombreTurno = e.target.value;
        setTurnoSeleccionado(nombreTurno);

        if (nombreTurno) {
            const horario = horariosPredefinidos.find(h => h.nombre_turno === nombreTurno);
            if (horario) {
                const formatTime = (timeStr) => timeStr.split(':').slice(0, 2).join(':');
                setHoraEntrada(formatTime(horario.hora_entrada));
                setHoraSalida(formatTime(horario.hora_salida));
                setDiasLaborales(JSON.parse(horario.dias_laborales));
            }
        }
    };

    const handleDiaChange = (dia) => {
        const newDias = [...diasLaborales];
        const index = newDias.indexOf(dia);
        if (index === -1) {
            newDias.push(dia);
        } else {
            newDias.splice(index, 1);
        }
        setDiasLaborales(newDias);
    };

    const handleAsignar = async () => {
        if (!trabajadorId || !turnoSeleccionado || !horaEntrada || !horaSalida) {
            alert('Complete todos los campos');
            return;
        }

        try {
            const horarioResponse = await fetch('http://localhost:5000/api/horarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_turno: turnoSeleccionado,
                    hora_entrada: horaEntrada,
                    hora_salida: horaSalida,
                    dias_laborales: diasLaborales,
                    tipo: 'personalizado'
                })
            });

            if (!horarioResponse.ok) {
                const errorData = await horarioResponse.json();
                throw new Error(errorData.error || 'Error al crear horario');
            }

            const nuevoHorario = await horarioResponse.json();

            const asignarResponse = await fetch(`http://localhost:5000/api/asignacion-horarios/${trabajadorId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_horario: nuevoHorario.id })
            });

            if (!asignarResponse.ok) {
                const errorData = await asignarResponse.json();
                throw new Error(errorData.error || 'Error al asignar horario');
            }

            alert('✅ Horario personalizado creado y asignado');
            loadData();
        } catch (err) {
            alert('❌ Error: ' + err.message);
        }
    };

    const getDaysInMonth = (year, month) => {
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    const year = parseInt(mes.split('-')[0]);
    const month = parseInt(mes.split('-')[1]) - 1;
    const days = getDaysInMonth(year, month);
    const diasSemana = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

     return (
<Container fluid className="py-4 bg-light" style={{ paddingLeft: '180px', paddingRight: '40px' }}>
      <Card className="shadow-lg border-0 rounded-4" style={{ maxWidth: '880px', width: '100%' }}>
        <Card.Header
          className="bg-primary text-white d-flex justify-content-between align-items-center rounded-top-4"
          style={{ padding: '1rem 1.5rem' }}
        >
          <h4 className="m-0">📅 Asignar Horario</h4>
        </Card.Header>

        <Card.Body className="p-4">
          <Form>
            {/* 1. Mes */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Seleccionar Mes</Form.Label>
              <Form.Control
                type="month"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="shadow-sm"
              />
            </Form.Group>

            {/* 2. Trabajador */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Trabajador</Form.Label>
              <Select
                value={
                  trabajadores.find((t) => t.id === trabajadorId)
                    ? {
                        value: trabajadorId,
                        label: `${trabajadores.find((t) => t.id === trabajadorId).dni} - ${
                          trabajadores.find((t) => t.id === trabajadorId).nombres
                        } ${trabajadores.find((t) => t.id === trabajadorId).apellidos}`,
                      }
                    : null
                }
                onChange={(option) => setTrabajadorId(option ? option.value : '')}
                onInputChange={(newValue) => setInputValue(newValue)}
                options={trabajadores
                  .filter(
                    (t) =>
                      inputValue &&
                      `${t.dni} ${t.nombres} ${t.apellidos}`
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                  )
                  .map((t) => ({
                    value: t.id,
                    label: `${t.dni} - ${t.nombres} ${t.apellidos}`,
                  }))}
                placeholder="🔍 Escriba para buscar trabajador..."
                isClearable
                menuIsOpen={inputValue.length > 0}
                noOptionsMessage={() =>
                  inputValue ? 'No se encontraron resultados' : 'Escriba para buscar...'
                }
                classNamePrefix="select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.5rem',
                    boxShadow: 'none',
                    borderColor: '#ced4da',
                    padding: '2px 4px',
                  }),
                }}
              />
            </Form.Group>
             {/* 6. Calendario */}
            {mes && (
              <div className="mb-4">
                <h5 className="text-center fw-semibold text-primary mb-3">
                  {new Date(year, month).toLocaleDateString('es-ES', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h5>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {days.map((day, index) => {
                    const diaSemana = day.getDay();
                    const esLaborable = diasLaborales.includes(diaSemana);
                    return (
                      <div
                        key={index}
                        className="border rounded-3 d-flex flex-column align-items-center justify-content-center shadow-sm"
                        style={{
                          width: '75px',
                          height: '75px',
                          backgroundColor: esLaborable ? '#e8f4ff' : '#fff',
                        }}
                      >
                        <div className="fw-bold">{day.getDate()}</div>
                        <small className="text-muted">{diasSemana[diaSemana]}</small>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Turno */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Turno</Form.Label>
              <Form.Select
                value={turnoSeleccionado}
                onChange={handleTurnoChange}
                className="shadow-sm"
              >
                <option value="">Seleccione un turno</option>
                {horariosPredefinidos.map((h) => (
                  <option key={h.id} value={h.nombre_turno}>
                    {h.nombre_turno}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* 4. Hora entrada / salida */}
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Hora de entrada</Form.Label>
                  <Form.Control
                    type="time"
                    value={horaEntrada}
                    onChange={(e) => setHoraEntrada(e.target.value)}
                    className="shadow-sm"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Hora de salida</Form.Label>
                  <Form.Control
                    type="time"
                    value={horaSalida}
                    onChange={(e) => setHoraSalida(e.target.value)}
                    className="shadow-sm"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* 5. Días laborales */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Días laborales</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(
                  (dia, index) => (
                    <Form.Check
                      key={index}
                      type="checkbox"
                      label={dia}
                      checked={diasLaborales.includes(index + 1)}
                      onChange={() => handleDiaChange(index + 1)}
                    />
                  )
                )}
              </div>
            </Form.Group>

           

            {/* 7. Botón */}
            <Button
              variant="primary"
              onClick={handleAsignar}
              className="w-100 fw-semibold py-2 rounded-3 shadow-sm"
            >
              💾 Crear y Asignar Horario
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}