const pool = require("../config/db");

exports.findByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};

exports.create = async (user) => {
  const { nombre, apellido, email, password, rol_id } = user;

  const result = await pool.query(
    `INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [nombre, apellido, email, password, rol_id],
  );

  return result.rows[0];
};

exports.getAll = async () => {
  const result = await pool.query("SELECT * FROM usuarios");
  return result.rows;
};
