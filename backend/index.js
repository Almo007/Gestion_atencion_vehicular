const express = require('express');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors());
app.use(express.json());

// Crear carpeta 'uploads' si no existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuración Multer para imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `img_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API de login funcionando');
});

// Login
app.post('/login', async (req, res) => {
  const { cedula_emp, clave } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM empleados WHERE cedula_emp = $1 AND clave = $2',
      [cedula_emp, clave]
    );
    if (result.rows.length > 0) {
      await pool.query(
        'UPDATE empleados SET ultimo_login = NOW() WHERE id_empleado = $1',
        [result.rows[0].id_empleado]
      );
      res.status(200).json({
        mensaje: 'Login exitoso',
        id_empleado: result.rows[0].id_empleado,
        nombre_emp: result.rows[0].nombre_emp,
        rol: result.rows[0].rol,
      });
    } else {
      res.status(401).json({ error: 'Cédula o clave incorrecta' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Solicitud con imagen
app.post('/solicitud', upload.single('imagen'), async (req, res) => {
  const {
    cedula_cli,
    nombre_cli,
    apellido_cli,
    celular_cli,
    numero_placa,
    marca_vehiculo,
    modelo_vehiculo,
    anio_vehiculo,
    color_vehiculo,
    tipo_vehiculo,
    tipo_combustible,
    descripcion_dano
  } = req.body;

  const nombre_imagen = req.file ? req.file.filename : null;

  try {
    await pool.query(
      `INSERT INTO solicitud_cliente (
        cedula_cli, nombre_cli, apellido_cli, celular_cli,
        numero_placa, marca_vehiculo, modelo_vehiculo, anio_vehiculo,
        color_vehiculo, tipo_vehiculo, tipo_combustible, imagen_dano,
        descripcion_dano
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        cedula_cli, nombre_cli, apellido_cli, celular_cli,
        numero_placa, marca_vehiculo, modelo_vehiculo, anio_vehiculo,
        color_vehiculo, tipo_vehiculo, tipo_combustible, nombre_imagen,
        descripcion_dano
      ]
    );
    res.status(200).json({ mensaje: 'Solicitud registrada con éxito' });
  } catch (err) {
    console.error('❌ ERROR en /solicitud:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Obtener solicitudes
app.get('/solicitudes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM solicitud_cliente ORDER BY id_solicitud DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ ERROR en /solicitudes:', err.message);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
});

// Actualizar estado de solicitud (pendiente, aprobado, rechazado)
app.post('/actualizar-estado', async (req, res) => {
  const { id_solicitud, estado_solicitud } = req.body;
  if (!id_solicitud || !estado_solicitud) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }
  try {
    const result = await pool.query(
      'UPDATE solicitud_cliente SET estado_solicitud = $1 WHERE id_solicitud = $2 RETURNING *',
      [estado_solicitud, id_solicitud]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    res.json({ mensaje: 'Estado actualizado correctamente', solicitud: result.rows[0] });
  } catch (err) {
    console.error('❌ ERROR en /actualizar-estado:', err.message);
    res.status(500).json({ error: 'Error interno al actualizar estado' });
  }
});

// Nueva ruta: actualizar estado de vehículo
app.put('/actualizar-estado-vehiculo', async (req, res) => {
  const { id_estado, estado_general, nivel_dano, observaciones } = req.body;

  if (!id_estado) {
    return res.status(400).json({ error: 'Falta id_estado' });
  }

  try {
    const result = await pool.query(
      `UPDATE estado_vehiculo 
       SET estado_general = $1, nivel_dano = $2, observaciones = $3 
       WHERE id_estado = $4 
       RETURNING *`,
      [estado_general, nivel_dano, observaciones, id_estado]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Estado de vehículo no encontrado' });
    }

    res.json({ mensaje: 'Estado de vehículo actualizado', estado: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar estado de vehículo:', error.message);
    res.status(500).json({ error: 'Error interno al actualizar estado de vehículo' });
  }
});

// Registrar empleado
app.post('/empleados', async (req, res) => {
  const { cedula, nombre, apellido, celular, clave, rol } = req.body;
  if (!cedula || !nombre || !apellido || !celular || !clave || !rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const existe = await pool.query('SELECT * FROM empleados WHERE cedula_emp = $1', [cedula]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un empleado con esa cédula' });
    }
    await pool.query(
      `INSERT INTO empleados (cedula_emp, nombre_emp, apellido_emp, celular_emp, clave, rol)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [cedula, nombre, apellido, celular, clave, rol]
    );
    res.status(201).json({ mensaje: 'Empleado registrado exitosamente' });
  } catch (err) {
    console.error('❌ ERROR al registrar empleado:', err.message);
    res.status(500).json({ error: 'Error al registrar empleado' });
  }
});

// Obtener empleados
app.get('/empleados', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM empleados ORDER BY id_empleado DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

// Eliminar solicitud
app.delete('/solicitudes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM solicitud_cliente WHERE id_solicitud = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });
    res.json({ mensaje: 'Solicitud eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno al eliminar solicitud' });
  }
});

// Eliminar empleado
app.delete('/empleados/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM empleados WHERE id_empleado = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json({ mensaje: 'Empleado eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno al eliminar empleado' });
  }
});

// Aprobar solicitud y guardar en estado_vehiculo
app.post('/api/aprobar-solicitud', async (req, res) => {
  const { id_solicitud, id_empleado } = req.body;
  try {
    await pool.query(
      `UPDATE solicitud_cliente
       SET estado_solicitud = 'Aprobado'
       WHERE id_solicitud = $1`,
      [id_solicitud]
    );

    const resultadoEstado = await pool.query(
      `INSERT INTO estado_vehiculo (id_solicitud, id_empleado)
       VALUES ($1, $2) RETURNING *`,
      [id_solicitud, id_empleado]
    );

    res.json({
      mensaje: 'Solicitud aprobada',
      estado: resultadoEstado.rows[0]
    });

  } catch (error) {
    console.error('Error al aprobar solicitud:', error.message);
    res.status(500).json({ error: 'Error al aprobar la solicitud' });
  }
});

// Obtener estado vehículos (con info de cliente y vehículo)
app.get('/estado-vehiculos', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ev.*, sc.id_solicitud, sc.nombre_cli, sc.apellido_cli, sc.cedula_cli, sc.numero_placa,
       sc.marca_vehiculo, sc.modelo_vehiculo, sc.anio_vehiculo, sc.color_vehiculo
       FROM estado_vehiculo ev
       JOIN solicitud_cliente sc ON ev.id_solicitud = sc.id_solicitud
       ORDER BY ev.id_estado DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ ERROR al obtener estado_vehiculo:', err.message);
    res.status(500).json({ error: 'Error al obtener los estados de los vehículos' });
  }
});

app.get('/consultar-vehiculos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        sc.id_solicitud,
        sc.cedula_cli,
        sc.nombre_cli,
        sc.apellido_cli,
        sc.marca_vehiculo,
        sc.modelo_vehiculo,
        sc.anio_vehiculo,
        sc.color_vehiculo,
        ev.nivel_dano,
        ev.observaciones,
        ev.estado_general
      FROM solicitud_cliente sc
      JOIN estado_vehiculo ev ON sc.id_solicitud = ev.id_solicitud
      ORDER BY ev.id_estado DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ ERROR al obtener estado_vehiculo:', err.message);
    res.status(500).json({ error: 'Error al obtener los estados de los vehículos' });
  }
});


const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend corriendo en http://0.0.0.0:${PORT}`);
});
