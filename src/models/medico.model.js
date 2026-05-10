const pool = require("../config/db");

//GET INFORMACIÓN DEL MÉDICO LOGEADO
exports.findMedicoLogged = async (id) => {
  const client = await pool.connect();

  try {
    //Consulta SQL uniendo tablas usuarios y medicos
    const query = `
        SELECT 
            U.id, U.nombre, U.apellido, U.dui, U.email, U.telefono,
            U.fecha_nacimiento AS "fechaNacimiento",
            U.genero AS "generoId", U.rol_id AS "rolId", U.activo,
            M.num_jvpm AS "numJvmp",
            M.especialidad_id AS especialidad,
            M.unidad_medica_id AS "unidadMedica"
        FROM usuarios U
        INNER JOIN medicos M ON U.id = M.usuario_id
        WHERE U.id = $1`;

    const response = await client.query(query, [id]);

    // Si no hay filas, el médico no existe
    if (response.rows.length === 0) {
      throw new Error(`No existe el médico con el ID: ${id}`);
    }

    //Retornamos el resultado encontrado
    return response.rows[0];
  } catch (err) {
    throw err;
  } finally {
    client.release(); //Liberar conexión
  }
};

// Funcion para crear un Medico
exports.create = async (data) => {
  // Hacemos un destructuring del objeto que traemos de user
  const {
    nombre,
    apellido,
    dui,
    email,
    password,
    telefono,
    fechaNacimiento,
    genero,
    rol,
    numJvpm,
    especialidad,
    unidadMedica,
  } = data;

  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Variables para retornar las columnas necesarias
    let result = {};

    // Iniciamos la transaccion
    await client.query("BEGIN");

    // Realizamos las inserciones en las tablas
    let response = await client.query(
      `INSERT INTO usuarios (nombre, apellido, dui, email, password_hash, telefono, fecha_nacimiento, genero, rol_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
       RETURNING id AS usuariosId, nombre, apellido, dui, email, telefono, fecha_nacimiento AS fechaNacimiento, genero, rol_id AS rolId`,
      [
        nombre,
        apellido,
        dui,
        email,
        password,
        telefono,
        fechaNacimiento,
        genero,
        rol,
      ],
    );

    // Verificamos si se registro el usuario
    if (!response.rows[0]) {
      throw new Error(`No se registro el paciente exitosamente.`);
    }

    // Seteamos los valores del usuario
    result = response.rows[0];

    response = await client.query(
      `INSERT INTO medicos (usuario_id, num_jvpm, especialidad_id, unidad_medica_id) 
       VALUES ($1,$2,$3,$4)
       RETURNING id AS medicoId, num_jvpm AS numJvpm, especialidad_id AS especialidadId, unidad_medica_id AS unidadMedicaId`,
      [result.usuariosid, numJvpm, especialidad, unidadMedica],
    );

    // Verificamos si el usuario tiene asignado un (Paciente/Medico)
    if (!response.rows[0]) {
      throw new Error(`No se logro registrar al medico correctamente.`);
    }

    result = { ...result, ...response.rows[0] };

    // Aceptamos cambios
    await client.query("COMMIT");

    // Retornamos el result por default de la db
    return result;
  } catch (err) {
    //Salio algo mal hacemos un rollback
    await client.query("ROLLBACK");
    if (err?.message?.includes("llave duplicada")) err.status = 409;
    throw err;
  } finally {
    //Liberamos la conexion
    client.release();
  }
};

// Funcion para obtener todos los medicos
exports.read = async () => {
  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    let result = await client.query(
      `SELECT U.id AS usuarioId, U.nombre, U.apellido, U.dui, U.email, U.telefono, U.fecha_nacimiento AS fechaNacimiento
        , U.genero, U.rol_id AS rolId, R.nombre AS rolNombre, U.activo, M.id, M.num_jvpm AS numJvpm
        , M.especialidad_id AS especialidadId, E.nombre AS especialidadNombre, M.unidad_medica_id AS unidadMedicaId
        , UM.nombre AS unidadMedicaNombre
       FROM medicos M 
        LEFT JOIN usuarios U ON U.id = M.usuario_id
        INNER JOIN roles R ON R.id = U.rol_id
        INNER JOIN especialidades E ON E.id = M.especialidad_id
        INNER JOIN unidades_medicas UM ON UM.id = M.unidad_medica_id`,
    );

    // Aceptamos cambios
    await client.query("COMMIT");

    // Verificamos si el usuario tiene asignado un (Paciente/Medico)
    if (!result.rows[0]) {
      throw new Error(`No se encontraron pacientes.`);
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

// Funcion para actualizar medico
exports.update = async (data) => {
  const {
    nombre,
    apellido,
    dui,
    email,
    password,
    telefono,
    fechaNacimiento,
    genero,
    rol,
    activo,
    numJvpm,
    especialidad,
    unidadMedica,
    id,
  } = data;

  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    let result = {};

    await client.query("BEGIN");

    // Actualizamos la tabla usuarios
    let response = await client.query(
      `UPDATE usuarios 
     SET nombre = $1,
         apellido = $2,
         dui = $3,
         email = $4,
         ${password ? "password_hash = $5," : ""}
         telefono = ${password ? "$6" : "$5"},
         fecha_nacimiento = ${password ? "$7" : "$6"},
         genero = ${password ? "$8" : "$7"},
         rol_id = ${password ? "$9" : "$8"},
         activo = ${password ? "$10" : "$9"}
     WHERE id = ${password ? "$11" : "$10"}
     RETURNING id AS usuariosId, nombre, apellido, dui, email, telefono, 
               fecha_nacimiento AS fechaNacimiento, genero, rol_id AS rolId, activo`,
      [
        nombre,
        apellido,
        dui,
        email,
        ...(password ? [password] : []),
        telefono,
        fechaNacimiento,
        genero,
        rol,
        activo,
        id,
      ],
    );

    if (!response.rows[0]) {
      throw new Error(`No se encontró el usuario para actualizar.`);
    }

    result = response.rows[0];

    // Actualizamos la tabla medicos
    response = await client.query(
      `UPDATE medicos 
     SET num_jvpm = $1,
         especialidad_id = $2,
         unidad_medica_id = $3
     WHERE usuario_id = $4
     RETURNING id AS medicoId, num_jvpm AS numJvpm, 
               especialidad_id AS especialidadId, unidad_medica_id AS unidadMedicaId`,
      [numJvpm, especialidad, unidadMedica, result.usuariosid],
    );

    if (!response.rows[0]) {
      throw new Error(`No se encontró el médico para actualizar.`);
    }

    result = { ...result, ...response.rows[0] };

    await client.query("COMMIT");

    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    if (err?.message?.includes("llave duplicada")) err.status = 409;
    throw err;
  } finally {
    client.release();
  }
};

// Funcion para pasar a inactivo al medico
exports.delete = async (id) => {
  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Actualizamos la tabla usuarios
    let response = await client.query(
      `UPDATE usuarios 
       SET activo = false
       WHERE id = $1
       RETURNING id AS usuarioId, activo`,
      [id],
    );

    // Verificar que el usuario existía
    if (!response.rows[0]) {
      throw new Error(`No se encontró el usuario para desactivar.`);
    }

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
