import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // 👈 Agrega esto
import './Login.css';
import apiBaseURL from '../config';


function App() {
  const [cedula_emp, setCedula] = useState('');
  const [clave, setClave] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate(); // 👈 Instancia el hook

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiBaseURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula_emp, clave }),
      });

      const data = await response.json();
      //console.log(data);

      if (response.ok) {
        localStorage.setItem('id_empleado', data.id_empleado);
        localStorage.setItem('rol', data.rol); // ✅ Guarda el rol para Inicio.js
        localStorage.setItem('nombre_emp', data.nombre_emp); // opcional
        setMensaje(`✔️ Bienvenido ${data.nombre_emp} (${data.rol})`);
        setTimeout(() => navigate('/inicio'), 1000);
      } else {
        setMensaje(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setMensaje('❌ Error al conectar con el servidor');
    }
  };

  return (
    <div className="App">
      <h2>Inicio de sesion</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Cédula"
          value={cedula_emp}
          onChange={(e) => setCedula(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Clave"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          required
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
      <p>{mensaje}</p>
    </div>
  );
}


export default App;
