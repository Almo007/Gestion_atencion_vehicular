import React, { useState, useEffect } from 'react';
import apiBaseURL from '../config';
import { useNavigate } from 'react-router-dom';
import './Inicio.css';
import RegistrarEmp from './RegistrarEmpleado';
import EstadoVehiculo from './EstadoVehiculo';

const Inicio = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const [cargando, setCargando] = useState(false);
  const [cargandoEmpleados, setCargandoEmpleados] = useState(false);
  const [cargandoSolicitudesGestion, setCargandoSolicitudesGestion] = useState(false);

  const [paginaActual, setPaginaActual] = useState(1);
  const solicitudesPorPagina = 5;

  const [vistaActiva, setVistaActiva] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroNombre, setFiltroNombre] = useState('');

  const rol = localStorage.getItem('rol');
  const nombreEmpleado = localStorage.getItem('nombre_emp');
  const navigate = useNavigate();

  const cargarSolicitudes = () => {
    setCargando(true);
    fetch(`${apiBaseURL}/solicitudes`)
      .then(res => res.json())
      .then(data => {
        setSolicitudes(data);
        setCargando(false);
      })
      .catch(err => {
        console.error(err);
        setCargando(false);
      });
  };

  const cargarSolicitudesGestion = () => {
    setCargandoSolicitudesGestion(true);
    fetch(`${apiBaseURL}/solicitudes`)
      .then(res => res.json())
      .then(data => {
        setSolicitudes(data);
        setCargandoSolicitudesGestion(false);
      })
      .catch(err => {
        console.error(err);
        setCargandoSolicitudesGestion(false);
      });
  };

  const cargarEmpleados = () => {
    setCargandoEmpleados(true);
    fetch(`${apiBaseURL}/empleados`)
      .then(res => res.json())
      .then(data => {
        setEmpleados(data);
        setCargandoEmpleados(false);
      })
      .catch(err => {
        console.error(err);
        setCargandoEmpleados(false);
      });
  };

  useEffect(() => {
    if (vistaActiva === 'solicitudes' && solicitudes.length === 0) {
      cargarSolicitudes();
    } else if (vistaActiva === 'gestionarSolicitudes') {
      cargarSolicitudesGestion();
    } else if (vistaActiva === 'gestionarEmpleados') {
      cargarEmpleados();
    }
  }, [vistaActiva]);

  const aprobarSolicitud = async (id) => {
    const idEmpleado = localStorage.getItem('id_empleado'); 
    if (!idEmpleado) {
      alert('Error: no se encontró el ID del empleado');
      return;
    }

    try {
      const res = await fetch(`${apiBaseURL}/api/aprobar-solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_solicitud: id, id_empleado: idEmpleado }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.mensaje);
        setSolicitudes(prev =>
          prev.map(s =>
            s.id_solicitud === id ? { ...s, estado_solicitud: 'Aprobado' } : s
          )
        );
      } else {
        alert(data.error || 'Error al aprobar la solicitud');
      }
    } catch (err) {
      console.error(err);
      alert('Error al aprobar la solicitud');
    }
  };


  const rechazarSolicitud = async (id) => {
    if (!window.confirm('¿Estás seguro de rechazar esta solicitud?')) return;
    try {
      const res = await fetch(`${apiBaseURL}/actualizar-estado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_solicitud: id, estado_solicitud: 'Rechazado' }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.mensaje);
        setSolicitudes(prev =>
          prev.map(s =>
            s.id_solicitud === id ? { ...s, estado_solicitud: 'Rechazado' } : s
          )
        );
      } else {
        alert(data.error || 'Error al rechazar la solicitud');
      }
    } catch (err) {
      console.error(err);
      alert('Error al rechazar la solicitud');
    }
  };

  const eliminarSolicitud = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta solicitud?')) return;

    try {
      const res = await fetch(`${apiBaseURL}/solicitudes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Solicitud eliminada');
        cargarSolicitudesGestion();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar solicitud');
      }
    } catch (err) {
      console.error(err);
      alert('Error al eliminar solicitud');
    }
  };

  const eliminarEmpleado = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este empleado?')) return;

    try {
      const res = await fetch(`${apiBaseURL}/empleados/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Empleado eliminado');
        cargarEmpleados();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar empleado');
      }
    } catch (err) {
      console.error(err);
      alert('Error al eliminar empleado');
    }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado, filtroNombre]);

  const solicitudesFiltradas = solicitudes.filter(s =>
    (filtroEstado === 'Todos' || s.estado_solicitud === filtroEstado) &&
    (`${s.nombre_cli} ${s.apellido_cli}`.toLowerCase().includes(filtroNombre.toLowerCase()) ||
      s.cedula_cli.toLowerCase().includes(filtroNombre.toLowerCase()))
  );

  const totalPaginas = Math.ceil(solicitudesFiltradas.length / solicitudesPorPagina);
  const indiceInicial = (paginaActual - 1) * solicitudesPorPagina;
  const solicitudesPaginadas = solicitudesFiltradas.slice(indiceInicial, indiceInicial + solicitudesPorPagina);

  return (
    <div style={{ display: 'flex' }}>
      <div className="inicio-sidebar">
        <div>
          <h2 style={{ marginBottom: '30px' }} className="title">🛠️ Taller Fernández</h2>
          <button className="title"onClick={() => setVistaActiva(vistaActiva === 'solicitudes' ? '' : 'solicitudes')} >Solicitudes</button>
          
          <button className="title" onClick={() => setVistaActiva(vistaActiva === 'estadoVehiculo' ? '' : 'estadoVehiculo')}>
            Estado de vehículo
          </button>

          {(rol?.toLowerCase().trim() === 'admin' || rol?.toLowerCase().trim() === 'gerente') && (
            <button className="title" onClick={() => setVistaActiva(vistaActiva === 'registrarEmpleado' ? '' : 'registrarEmpleado')}>Registrar empleado</button>
          )}
          {rol?.toLowerCase().trim() === 'admin' && (
            <>
              <button className="title" onClick={() => setVistaActiva(vistaActiva === 'gestionarSolicitudes' ? '' : 'gestionarSolicitudes')}>Gestionar solicitudes</button>
              <button className="title" onClick={() => setVistaActiva(vistaActiva === 'gestionarEmpleados' ? '' : 'gestionarEmpleados')}>Gestionar empleados</button>
            </>
          )}
        
        </div>
        <div>
          <p className="title">👤 {nombreEmpleado} ({rol})</p>
          <button className="logout-button" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </div>

      <div className="inicio-main">
        <h1 className="text">Bienvenido {nombreEmpleado} </h1>

        {vistaActiva === 'registrarEmpleado' && <RegistrarEmp />}

        {vistaActiva === 'solicitudes' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Buscar por nombre o cédula"
                value={filtroNombre}
                onChange={e => setFiltroNombre(e.target.value)}
                style={{ marginRight: '10px', padding: '5px' }}
              />
              <select
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                style={{ padding: '5px' }}
              >
                <option value="Todos">Todos</option>
                <option value="Pendiente">Pendientes</option>
                <option value="Aprobado">Aprobados</option>
                <option value="Rechazado">Rechazados</option>
              </select>
            </div>

            {cargando ? (
              <p>Cargando solicitudes...</p>
            ) : solicitudesFiltradas.length === 0 ? (
              <p>No hay solicitudes que coincidan con el filtro.</p>
            ) : (
              <>
                {solicitudesPaginadas.map(solicitud => (
                  <div key={solicitud.id_solicitud} className="solicitud-card" >
                    <p className="text"><strong>Solicitud Nº:</strong> {solicitud.id_solicitud} </p>
                    <h3>{solicitud.nombre_cli} {solicitud.apellido_cli}</h3>
                    <p className="text"><strong>Cédula:</strong> {solicitud.cedula_cli} </p>
                    <p className="text"><strong>Celular:</strong> {solicitud.celular_cli}</p>
                    <p className="text"><strong>Placa:</strong> {solicitud.numero_placa}</p>
                    <p className="text"><strong>Vehículo:</strong> {solicitud.marca_vehiculo} {solicitud.modelo_vehiculo} ({solicitud.anio_vehiculo})</p>
                    <p className="text"><strong>Color:</strong> {solicitud.color_vehiculo}</p>
                    <p className="text"><strong>Tipo:</strong> {solicitud.tipo_vehiculo}</p>
                    <p className="text"><strong>Combustible:</strong> {solicitud.tipo_combustible}</p>
                    <p className="text"><strong>Daño:</strong> {solicitud.descripcion_dano}</p>
                    <p className="text"><strong>Estado:</strong> {solicitud.estado_solicitud}</p>
                    {solicitud.imagen_dano && (
                      <img
                        src={`${apiBaseURL}/uploads/${solicitud.imagen_dano}`}
                        alt="Daño vehicular"
                        style={{ maxWidth: '300px', marginTop: '10px' }}
                      />
                    )}
                    {solicitud.estado_solicitud.toLowerCase() === 'pendiente' && (
                      <div style={{ marginTop: '10px' }}>
                        <button onClick={() => aprobarSolicitud(solicitud.id_solicitud)} style={{ marginRight: '10px', backgroundColor: 'green', color: 'white' }}>✅ Aprobar</button>
                        <button onClick={() => rechazarSolicitud(solicitud.id_solicitud)} style={{ backgroundColor: 'red', color: 'white' }}>❌ Rechazar</button>
                      </div>
                    )}
                  </div>
                ))}
                {totalPaginas > 1 && (
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    {Array.from({ length: totalPaginas }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPaginaActual(i + 1)}
                        style={{
                          margin: '0 5px',
                          padding: '5px 10px',
                          backgroundColor: i + 1 === paginaActual ? '#3acfd5' : '#1e1e2f',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}


        {vistaActiva === 'estadoVehiculo' && (
            <>
              <EstadoVehiculo />
            </>
          )}

        {vistaActiva === 'gestionarSolicitudes' && (
          <>
            <h2 class="text">Gestionar Solicitudes</h2>
            <input
              type="text"
              placeholder="Buscar por cédula"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              style={{ marginBottom: '15px', padding: '5px' }}
            />
            {cargandoSolicitudesGestion ? (
              <p>Cargando solicitudes...</p>
            ) : solicitudes.length === 0 ? (
              <p>No hay solicitudes.</p>
            ) : (
              solicitudes
                .filter(s => s.cedula_cli.toLowerCase().includes(filtroNombre.toLowerCase()))
                .map(s => (
                  <div key={s.id_solicitud} className="solicitud-card">
                    <p class="text"><strong>Solicitud Nº:</strong>{s.id_solicitud}</p>
                    <p class="text"><strong>{s.nombre_cli} {s.apellido_cli}</strong> - {s.estado_solicitud}</p>
                    <p class="text"><strong>Cédula:</strong> {s.cedula_cli}</p>
                    <button onClick={() => eliminarSolicitud(s.id_solicitud)} style={{ backgroundColor: 'red', color: 'white' }}>Eliminar</button>
                  </div>
                ))
            )}
          </>
        )}

        {vistaActiva === 'gestionarEmpleados' && (
          <>
            <h2 class="text">Gestionar Empleados</h2>
            <input
              type="text"
              placeholder="Buscar por cédula"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              style={{ marginBottom: '15px', padding: '5px' }}
            />
            {cargandoEmpleados ? (
              <p>Cargando empleados...</p>
            ) : empleados.length === 0 ? (
              <p>No hay empleados.</p>
            ) : (
              empleados
                .filter(e => e.cedula_emp?.toLowerCase().includes(filtroNombre.toLowerCase()))
                .map(e => (
                  <div key={e.id_empleado} className="solicitud-card">
                    <p class="text"><strong>{e.nombre_emp} {e.apellido_emp}</strong> - {e.rol}</p>
                    <p class="text"><strong>Cédula:</strong> {e.cedula_emp}</p>
                    <button onClick={() => eliminarEmpleado(e.id_empleado)} style={{ backgroundColor: 'red', color: 'white' }}>Eliminar</button>
                  </div>
                ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Inicio;
