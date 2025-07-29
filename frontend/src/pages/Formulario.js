import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Formulario.css';
import apiBaseURL from '../config';

function Formulario() {
  const [formulario, setFormulario] = useState({
    cedula_cli: '',
    nombre_cli: '',
    apellido_cli: '',
    celular_cli: '',
    numero_placa: '',
    marca_vehiculo: '',
    modelo_vehiculo: '',
    anio_vehiculo: '',
    color_vehiculo: '',
    tipo_vehiculo: '',
    tipo_combustible: '',
    descripcion_dano: ''
  });

  const [imagen, setImagen] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    switch (name) {
      case 'cedula_cli':
      case 'celular_cli':
        // Solo números, máximo 10 dígitos
        newValue = value.replace(/\D/g, '').slice(0, 10);
        break;

      case 'anio_vehiculo':
        // Solo números, máximo 4 dígitos
        newValue = value.replace(/\D/g, '').slice(0, 4);
        break;

      case 'numero_placa':
        // Solo letras y números, máximo 6, todo mayúsculas
        newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
        break;

      case 'nombre_cli':
      case 'apellido_cli':
      case 'marca_vehiculo':
      case 'modelo_vehiculo':
      case 'color_vehiculo':
      case 'descripcion_dano':
        // Capitaliza primera letra
        newValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        break;

      default:
        break;
    }

    setFormulario((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleImagenChange = (e) => {
    setImagen(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(formulario).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (imagen) {
      formData.append('imagen', imagen);
    }

    try {
      const response = await fetch(`${apiBaseURL}/solicitud`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Solicitud registrada con éxito');
        setFormulario({
          cedula_cli: '',
          nombre_cli: '',
          apellido_cli: '',
          celular_cli: '',
          numero_placa: '',
          marca_vehiculo: '',
          modelo_vehiculo: '',
          anio_vehiculo: '',
          color_vehiculo: '',
          tipo_vehiculo: '',
          tipo_combustible: '',
          descripcion_dano: ''
        });
        setImagen(null);
      } else {
        alert('❌ Error al registrar: ' + (data.error || 'Desconocido'));
      }
    } catch (error) {
      console.error(error);
      alert('❌ Error de conexión con el servidor');
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Formulario de Solicitud</h1>
        
      </header>

      <form onSubmit={handleSubmit} className="solicitud-formulario" encType="multipart/form-data">
        <label  htmlFor="cedula_cli">Cedula:</label>
        <input  name="cedula_cli" placeholder="Cédula" value={formulario.cedula_cli} onChange={handleChange} required />

        <label  htmlFor="nombre_cli">Nombre:</label>
        <input name="nombre_cli" placeholder="Nombre" value={formulario.nombre_cli} onChange={handleChange} required />

        <label  htmlFor="apellido_cli">Apellido:</label>
        <input name="apellido_cli" placeholder="Apellido" value={formulario.apellido_cli} onChange={handleChange} required />

        <label  htmlFor="celular_cli">Celular:</label>
        <input name="celular_cli" placeholder="Celular" value={formulario.celular_cli} onChange={handleChange} required />

        <label  htmlFor="numero_placa">Placa:</label>
        <input name="numero_placa" placeholder="Placa" value={formulario.numero_placa} onChange={handleChange} required />

        <label  htmlFor="marca_vehiculo">Marca:</label>
        <input name="marca_vehiculo" placeholder="Marca" value={formulario.marca_vehiculo} onChange={handleChange} required />

        <label  htmlFor="modelo_vehiculo">Modelo:</label>
        <input name="modelo_vehiculo" placeholder="Modelo" value={formulario.modelo_vehiculo} onChange={handleChange} required />

        <label  htmlFor="anio_vehiculo">Año:</label>
        <input name="anio_vehiculo" type="text" placeholder="Año" value={formulario.anio_vehiculo} onChange={handleChange} required />

        <label  htmlFor="color_vehiculo">Color:</label>
        <input name="color_vehiculo" placeholder="Color" value={formulario.color_vehiculo} onChange={handleChange} required />

        <label  htmlFor="tipo_vehiculo">Tipo de Vehículo:</label>
        <select name="tipo_vehiculo" value={formulario.tipo_vehiculo} onChange={handleChange} required>
          <option value="">Seleccionar</option>
          <option value="Sedán">Sedán</option>
          <option value="Camioneta">Camioneta</option>
          <option value="SUV">SUV</option>
          <option value="Motocicleta">Motocicleta</option>
          <option value="Pick-up">Pick-up</option>
          <option value="Furgoneta">Furgoneta</option>
          <option value="Coupé">Coupé</option>
          <option value="Convertible">Convertible</option>
          <option value="Van / Microbús">Van / Microbús</option>
          <option value="Bus">Bus</option>
        </select>

        <label  htmlFor="tipo_combustible">Tipo de Combustible:</label>
        <select name="tipo_combustible" value={formulario.tipo_combustible} onChange={handleChange} required>
          <option value="">Seleccionar</option>
          <option value="Gasolina">Gasolina</option>
          <option value="Diésel">Diésel</option>
          <option value="Eléctrico">Eléctrico</option>
          <option value="Híbrido">Híbrido</option>
        </select>

        <textarea name="descripcion_dano" placeholder="Descripción del daño" value={formulario.descripcion_dano} onChange={handleChange} required />

        <label   htmlFor="imagen">Imagen del daño (opcional):</label>
        <input type="file" name="imagen" accept="image/*" onChange={handleImagenChange} />

        <button type="submit">Enviar Solicitud</button>
        <Link to="/" className="login-button">Volver al inicio</Link>
      </form>
    </div>
  );
}

export default Formulario;
