const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',       
  host: 'localhost',
  database: 'BD_Taller_Fernandez',
  password: '1234', 
  port: 5432,
});

module.exports = pool;
