import React, { useState } from 'react';
import apiBaseURL from '../config';
import './RegistrarEmpleado.css';

const RegistrarEmp = () => {
  const [form, setForm] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    celular: '',
    clave: '',
    rol: '',
  });

  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cedula' || name === 'celular') {
      // Solo números y máximo 10 dígitos
      const soloNumeros = value.replace(/\D/g, '').slice(0, 10);
      setForm({ ...form, [name]: soloNumeros });
    } else if (name === 'nombre' || name === 'apellido') {
      // Capitaliza la primera letra
      const capitalizado = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      setForm({ ...form, [name]: capitalizado });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validarClave = (clave) => {
    const tieneLongitud = clave.length >= 6;
    const tieneEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(clave);
    return tieneLongitud && tieneEspecial;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarClave(form.clave)) {
      setMensaje('❌ La clave debe tener al menos 6 caracteres y un carácter especial');
      return;
    }

    try {
      const res = await fetch(`${apiBaseURL}/empleados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje('✅ Empleado registrado correctamente');
        setForm({ cedula: '', nombre: '', apellido: '', celular: '', clave: '', rol: '' });
      } else {
        setMensaje(`❌ ${data.error || 'Error al registrar empleado'}`);
      }
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error de conexión al registrar empleado');
    }
  };

  const rolActual = localStorage.getItem('rol')?.toLowerCase().trim();

  return (
    <div style={{ padding: '20px' }} class="textos">
      <h2 class="textos">Registrar nuevo empleado</h2>
      {mensaje && <p>{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <input
          name="cedula"
          placeholder="Cédula"
          value={form.cedula}
          onChange={handleChange}
          required
          inputMode="numeric"
          pattern="\d{10}"
          title="Debe contener 10 dígitos"
        />
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          name="apellido"
          placeholder="Apellido"
          value={form.apellido}
          onChange={handleChange}
          required
        />
        <input
          name="celular"
          placeholder="Celular"
          value={form.celular}
          onChange={handleChange}
          required
          inputMode="numeric"
          pattern="\d{10}"
          title="Debe contener 10 dígitos"
        />
        <input
          name="clave"
          placeholder="Clave"
          type="password"
          value={form.clave}
          onChange={handleChange}
          required
        />
        <select name="rol" value={form.rol} onChange={handleChange} required>
          <option value="">Seleccionar rol</option>
          {rolActual === 'admin' && (
            <>
              <option value="Empleado">Empleado</option>
              <option value="Gerente">Gerente</option>
              <option value="Admin">Admin</option>
            </>
          )}
          {rolActual === 'gerente' && (
            <option value="Empleado">Empleado</option>
          )}
        </select>
        <br />
        <button type="submit" style={{ marginTop: '10px' }}>Registrar</button>
      </form>
    </div>
  );
};

export default RegistrarEmp;
