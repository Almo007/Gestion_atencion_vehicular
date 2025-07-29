import React from 'react';
import { Link } from 'react-router-dom';
import './Principal.css';
import ConsultarVehiculos from './ConsultarVehiculos';

function Home() {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/login" className="nav-button">Iniciar sesión</Link>
        </div>

        <div className="nav-right">
          <Link to="/formulario" className="nav-button">Formulario</Link>
          <a href="#consulta-estado" className="nav-button">Consultar Estado</a>
        </div>
      </nav>

      <div className="content-wrapper">
        <header className="home-header">
          <h1 class="title">Taller de Enderezada y Pintura Fernández</h1>
        </header>

        <main>
          <section id="consulta-estado" className="section">
            <h2>Estado de los vehículos</h2>
            <ConsultarVehiculos />
          </section>
        </main>
      </div>

      <footer className="footer-info">
        <div className="footer-section">
          <h3>Sobre Nosotros</h3>
          <p>Información sobre el taller.</p>
        </div>
        <div className="footer-section">
          <h3>Información</h3>
          <p>Datos de contacto, horarios, dirección.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
