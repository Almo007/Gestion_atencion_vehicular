import React, { useState, useEffect } from 'react';
import apiBaseURL from '../config';

const ConsultarVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [cedulaFiltro, setCedulaFiltro] = useState('');
  const [cargando, setCargando] = useState(false);

  const fetchVehiculos = () => {
    setCargando(true);
    fetch(`${apiBaseURL}/consultar-vehiculos`)
      .then(res => res.json())
      .then(data => {
        const filtrados = data.filter(v => v.estado_general?.toLowerCase() !== 'entregado');
        setVehiculos(filtrados);
        setCargando(false);
      })
      .catch(err => {
        console.error('Error al obtener estados:', err);
        setCargando(false);
      });
  };

  useEffect(() => {
    fetchVehiculos();
    const intervalo = setInterval(fetchVehiculos, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const vehiculosFiltrados = vehiculos.filter(v =>
    v.nombre_cli?.toLowerCase().includes(cedulaFiltro.toLowerCase()) ||
    v.apellido_cli?.toLowerCase().includes(cedulaFiltro.toLowerCase()) ||
    v.numero_placa?.toLowerCase().includes(cedulaFiltro.toLowerCase()) ||
    v.cedula_cli?.toLowerCase().includes(cedulaFiltro.toLowerCase())
  );

  return (
    <div className="consultar-vehiculos-container">
      <input
        type="text"
        placeholder="Buscar por cédula o nombre"
        value={cedulaFiltro}
        onChange={e => setCedulaFiltro(e.target.value)}
        style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%', maxWidth: '400px' }}
      />
      {cargando ? (
        <p>Cargando datos...</p>
      ) : vehiculosFiltrados.length === 0 ? (
        <p>No hay vehículos para mostrar.</p>
      ) : (
        <table className="tabla-vehiculos">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Año</th>
              <th>Color</th>
              <th>Daño</th>
              <th>Observaciones</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosFiltrados.map((vehiculo, index) => (
              <tr key={vehiculo.id_solicitud || index}>
                <td>{vehiculo.nombre_cli} {vehiculo.apellido_cli}</td>
                <td>{vehiculo.marca_vehiculo}</td>
                <td>{vehiculo.modelo_vehiculo}</td>
                <td>{vehiculo.anio_vehiculo || 'N/A'}</td>
                <td>{vehiculo.color_vehiculo || 'N/A'}</td>
                <td>{vehiculo.nivel_dano || '-'}</td>
                <td>{vehiculo.observaciones || '-'}</td>
                <td>{vehiculo.estado_general || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
};

export default ConsultarVehiculos;
