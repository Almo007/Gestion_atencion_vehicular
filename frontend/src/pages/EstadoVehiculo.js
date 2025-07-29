import React, { useState, useEffect } from 'react';
import apiBaseURL from '../config';
import './EstadoVehiculo.css';

const EstadoVehiculo = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [vehiculosBloqueados, setVehiculosBloqueados] = useState(new Set());

  useEffect(() => {
    fetch(`${apiBaseURL}/estado-vehiculos`)
      .then(res => res.json())
      .then(data => {
        setVehiculos(data);

        // Inicializar vehiculosBloqueados con los que ya están Entregados en backend
        const bloqueadosInicial = new Set(
          data.filter(v => v.estado_general?.toLowerCase() === 'entregado').map(v => v.id_estado)
        );
        setVehiculosBloqueados(bloqueadosInicial);
      })
      .catch(err => console.error('Error al obtener estados:', err));
  }, []);

  const actualizarEstado = (id_estado, estado_general, nivel_dano, observaciones) => {
    setCargando(true);
    fetch(`${apiBaseURL}/actualizar-estado-vehiculo`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_estado,
        estado_general,
        nivel_dano,
        observaciones,
      }),
    })
      .then(res => res.json())
      .then(() => {
        alert('Estado actualizado correctamente');
        setCargando(false);

        if (estado_general.toLowerCase() === 'entregado') {
          // Añadir a bloqueados para congelar edición
          setVehiculosBloqueados(prev => new Set(prev).add(id_estado));
        }
      })
      .catch(err => {
        console.error('Error al actualizar:', err);
        setCargando(false);
      });
  };

  const handleChange = (index, campo, valor) => {
    const copia = [...vehiculos];
    copia[index][campo] = valor;
    setVehiculos(copia);
  };

  return (
    <div className="estado-vehiculo-container">
      <h2 class="text">Estado de Vehículos</h2>
      {vehiculos.length === 0 ? (
        <p>No hay vehículos para mostrar.</p>
      ) : (
        vehiculos.map((vehiculo, index) => {
          const bloqueado = vehiculosBloqueados.has(vehiculo.id_estado);

          return (
            <div className="card-vehiculo" key={vehiculo.id_estado}>
              <p class="text"><strong>ID Estado:</strong> {vehiculo.id_estado}</p>
              <p class="text"><strong>Solicitud Nº:</strong>{vehiculo.id_solicitud}</p>
              <p class="text"><strong>Cliente:</strong> {vehiculo.nombre_cli} {vehiculo.apellido_cli}</p>
              <p class="text"><strong>Vehículo:</strong> {vehiculo.marca_vehiculo} {vehiculo.modelo_vehiculo} - {vehiculo.numero_placa}</p>

              <label>Estado General:</label>
              <select
                value={vehiculo.estado_general || 'Espera'}
                onChange={(e) => handleChange(index, 'estado_general', e.target.value)}
                disabled={bloqueado}
              >
                <option value="Espera">Espera</option>
                <option value="Recibido">Recibido</option>
                <option value="En reparación">En reparación</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Entregado">Entregado</option>
              </select>

              <label>Nivel de Daño:</label>
              <select
                value={vehiculo.nivel_dano || 'Valorizando'}
                onChange={(e) => handleChange(index, 'nivel_dano', e.target.value)}
                disabled={bloqueado}
              >
                <option value="Valorizando">Valorizando</option>
                <option value="Leve">Leve</option>
                <option value="Moderado">Moderado</option>
                <option value="Grave">Grave</option>
                <option value="Arreglado">Arreglado</option>
              </select>

              <label>Observaciones:</label>
              <textarea
                value={vehiculo.observaciones || ''}
                onChange={(e) => handleChange(index, 'observaciones', e.target.value)}
                rows={3}
                placeholder="Escribe observaciones aquí..."
                disabled={bloqueado}
              />

              <button
                onClick={() =>
                  actualizarEstado(
                    vehiculo.id_estado,
                    vehiculo.estado_general,
                    vehiculo.nivel_dano,
                    vehiculo.observaciones
                  )
                }
                disabled={cargando || bloqueado}
                style={{
                  backgroundColor: bloqueado ? 'gray' : '#007bff',
                  color: 'white',
                  cursor: bloqueado ? 'not-allowed' : 'pointer',
                  marginTop: '10px',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                }}
              >
                {cargando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};

export default EstadoVehiculo;
