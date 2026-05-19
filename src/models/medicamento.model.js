const pool = require("../config/db");

//GET TODOS LOS MEDICAMENTOS ACTIVOS O UN MEDICAMENTO POR ID
exports.getMedicine = async (id = null) => {
  const client = await pool.connect();

  try {
    //Consulta para obtener todos los medicamentos disponibles o un medicamento por id
    const query = `
      SELECT id, nombre_generico AS "nombreGenerico",
      nombre_comercial AS "nombreComercial",
      forma_farmaceutica AS "formaFarmaceutica",
      concentracion, activo
      FROM medicamentos 
      WHERE activo = True 
        AND ($1::INT IS NULL OR id = $1::INT)
      ORDER BY id ASC`;
    const response = await client.query(query, [id]);

    // Si no hay filas
    if (response.rows.length === 0) {
      throw new Error(`No hay medicamentos disponibles`);
    }

    return response.rows;
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// Funcion para obtener todos los medicamentos
exports.read = async () => {
  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    let result = await client.query(
      `SELECT id, nombre_generico AS nombreGenerico, nombre_comercial AS nombreComercial
        , forma_farmaceutica AS formaFarmaceutica, concentracion, activo
       FROM medicamentos
       ORDER BY nombre_generico ASC`,
    );

    // Aceptamos cambios
    await client.query("COMMIT");

    // Verificamos si se encontraron medicamentos
    if (!result.rows[0]) {
      throw new Error(`No se encontraron medicamentos.`);
    }

    // Retornamos el result por default de la db
    return result.rows;
  } catch (err) {
    // Salio algo mal hacemos un rollback
    await client.query("ROLLBACK");
    throw err;
  } finally {
    // Liberamos la conexion
    client.release();
  }
};

// Funcion para actualizar medicamento
exports.update = async (data) => {
  // Hacemos un destructuring del objeto que traemos
  const {
    nombreGenerico,
    nombreComercial,
    formaFarmaceutica,
    concentracion,
    activo,
    id,
  } = data;

  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    // Actualizamos la tabla medicamentos
    let response = await client.query(
      `UPDATE medicamentos
       SET nombre_generico    = $1,
           nombre_comercial   = $2,
           forma_farmaceutica = $3,
           concentracion      = $4,
           activo             = $5
       WHERE id = $6
       RETURNING id, nombre_generico AS nombreGenerico, nombre_comercial AS nombreComercial
        , forma_farmaceutica AS formaFarmaceutica, concentracion, activo`,
      [
        nombreGenerico,
        nombreComercial,
        formaFarmaceutica,
        concentracion,
        activo,
        id,
      ],
    );

    // Verificamos si se actualizo
    if (!response.rows[0]) {
      throw new Error(`No se encontró el medicamento para actualizar.`);
    }

    // Aceptamos cambios
    await client.query("COMMIT");

    // Retornamos el result por default de la db
    return response.rows[0];
  } catch (err) {
    // Salio algo mal hacemos un rollback
    await client.query("ROLLBACK");
    if (err?.message?.includes("llave duplicada")) err.status = 409;
    throw err;
  } finally {
    // Liberamos la conexion
    client.release();
  }
};

// Funcion para pasar a inactivo al medicamento
exports.delete = async (id) => {
  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    // Actualizamos la tabla medicamentos
    let response = await client.query(
      `UPDATE medicamentos
       SET activo = false
       WHERE id = $1
       RETURNING id, activo`,
      [id],
    );

    // Verificar que el medicamento existía
    if (!response.rows[0]) {
      throw new Error(`No se encontró el medicamento para desactivar.`);
    }

    // Aceptamos cambios
    await client.query("COMMIT");

    return response.rows[0];
  } catch (err) {
    // Salio algo mal hacemos un rollback
    await client.query("ROLLBACK");
    throw err;
  } finally {
    // Liberamos la conexion
    client.release();
  }
};
