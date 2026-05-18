const pool = require("../config/db"); // Tu configuración de conexión

// Crear Unidad Médica
exports.create = async (data) => {
  const {
    nombre,
    codigo,
    direccion,
    municipioId,
    latitud,
    longitud,
    telefono,
    email,
  } = data;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const query = `
      INSERT INTO unidades_medicas (nombre, codigo, direccion, municipio_id, latitud, longitud, telefono, email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, nombre, codigo, direccion, municipio_id AS municipioId, latitud, longitud, telefono, email, activo`;

    const response = await client.query(query, [
      nombre,
      codigo,
      direccion,
      municipioId,
      latitud,
      longitud,
      telefono,
      email,
    ]);

    if (!response.rows[0])
      throw new Error("No se pudo registrar la unidad médica.");

    await client.query("COMMIT");
    return response.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    if (err?.message?.includes("llave duplicada")) err.status = 409;
    throw err;
  } finally {
    client.release();
  }
};

// Leer todas las Unidades Médicas
exports.read = async () => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT UM.id, UM.nombre, UM.codigo, UM.direccion, UM.municipio_id AS municipioId, M.nombre AS municipioNombre
        , UM.latitud, UM.longitud, UM.telefono, UM.email, UM.activo
      FROM unidades_medicas UM
        INNER JOIN municipios M ON M.id = UM.municipio_id
      ORDER BY nombre ASC`;

    const result = await client.query(query);
    return result.rows;
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// Actualizar Unidad Médica
exports.update = async (data) => {
  const {
    id,
    nombre,
    codigo,
    direccion,
    municipioId,
    latitud,
    longitud,
    telefono,
    email,
    activo,
  } = data;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const query = `
      UPDATE unidades_medicas
      SET nombre = $1, codigo = $2, direccion = $3, municipio_id = $4, latitud = $5, longitud = $6, telefono = $7, email = $8, activo = $9
      WHERE id = $10
      RETURNING id, nombre, codigo, direccion, municipio_id AS municipioId, latitud, longitud, telefono, email, activo`;

    const response = await client.query(query, [
      nombre,
      codigo,
      direccion,
      municipioId,
      latitud,
      longitud,
      telefono,
      email,
      activo,
      id,
    ]);

    if (!response.rows[0])
      throw new Error("Unidad médica no encontrada para actualizar.");

    await client.query("COMMIT");
    return response.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Desactivar Unidad Médica (Borrado lógico)
exports.delete = async (id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const response = await client.query(
      `UPDATE unidades_medicas SET activo = false WHERE id = $1 RETURNING id, activo`,
      [id],
    );

    if (!response.rows[0]) throw new Error("Unidad médica no encontrada.");

    await client.query("COMMIT");
    return response.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
