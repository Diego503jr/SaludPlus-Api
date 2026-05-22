const { Pool } = require("pg");
require("dotenv").config();

//Conexion directa a la base de datos por medio de variables de entorno
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
      },
);

pool.connect((err) => {
  if (err) {
    console.error("Error conectando a la BD:", err.message);
  } else {
    console.log("Conectado a PostgreSQL correctamente");
  }
});

module.exports = pool;
