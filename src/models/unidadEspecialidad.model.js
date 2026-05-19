const pool = require("../config/db");

// Funcion para crear una unidad_especialidad
exports.create = async (data) => {
  // Hacemos un destructuring del objeto que traemos
  const { unidadMedica, especialidad, cupoDiario } = data;

  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    // Realizamos la insercion en la tabla
    let response = await client.query(
      `INSERT INTO unidad_especialidad (unidad_medica_id, especialidad_id, cupo_diario)
       VALUES ($1, $2, $3)
       RETURNING id, unidad_medica_id AS unidadMedicaId, especialidad_id AS especialidadId
        , cupo_diario AS cupoDiario, activo`,
      [unidadMedica, especialidad, cupoDiario],
    );

    // Verificamos si se registro
    if (!response.rows[0]) {
      throw new Error(`No se registró la unidad especialidad correctamente.`);
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

// Funcion para obtener todas las unidad_especialidad
exports.read = async () => {
  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    let result = await client.query(
      `SELECT UE.id, UE.unidad_medica_id AS unidadMedicaId, UM.nombre AS unidadMedicaNombre
        , UE.especialidad_id AS especialidadId, E.nombre AS especialidadNombre
        , UE.cupo_diario AS cupoDiario, UE.activo
       FROM unidad_especialidad UE
        INNER JOIN unidades_medicas UM ON UM.id = UE.unidad_medica_id
        INNER JOIN especialidades E ON E.id = UE.especialidad_id
       ORDER BY UM.nombre ASC, E.nombre ASC`,
    );

    // Aceptamos cambios
    await client.query("COMMIT");

    // Verificamos si se encontraron registros
    if (!result.rows[0]) {
      throw new Error(`No se encontraron unidades especialidad.`);
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

// Funcion para actualizar unidad_especialidad
exports.update = async (data) => {
  // Hacemos un destructuring del objeto que traemos
  const { unidadMedica, especialidad, cupoDiario, activo, id } = data;

  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    // Actualizamos la tabla unidad_especialidad
    let response = await client.query(
      `UPDATE unidad_especialidad
       SET unidad_medica_id = $1,
           especialidad_id  = $2,
           cupo_diario      = $3,
           activo           = $4
       WHERE id = $5
       RETURNING id, unidad_medica_id AS unidadMedicaId, especialidad_id AS especialidadId
        , cupo_diario AS cupoDiario, activo`,
      [unidadMedica, especialidad, cupoDiario, activo, id],
    );

    // Verificamos si se actualizo
    if (!response.rows[0]) {
      throw new Error(`No se encontró la unidad especialidad para actualizar.`);
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

// Funcion para pasar a inactivo la unidad_especialidad
exports.delete = async (id) => {
  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    // Actualizamos la tabla unidad_especialidad
    let response = await client.query(
      `UPDATE unidad_especialidad
       SET activo = false
       WHERE id = $1
       RETURNING id, activo`,
      [id],
    );

    // Verificar que el registro existía
    if (!response.rows[0]) {
      throw new Error(`No se encontró la unidad especialidad para desactivar.`);
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
