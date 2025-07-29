// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Principal';
import Login from './pages/Login';
import Formulario from './pages/Formulario';
import Inicio from './pages/Inicio';
import ConsultarVehiculos from './pages/ConsultarVehiculos';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Formulario" element={<Formulario />} />
        <Route path="/Inicio" element={<Inicio />} /> 
        <Route path="/consultar" element={<ConsultarVehiculos />} />
      </Routes>
    </Router>
  );
}

export default App;
