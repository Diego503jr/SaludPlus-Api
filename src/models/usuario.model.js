const pool = require("../config/db");

// Funcion by paciente (LOGIN)
exports.findByPacient = async (user) => {
  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    let result = await client.query(
      `SELECT U.id AS usuarioId, U.nombre, U.apellido, U.dui, U.email, U.password_hash AS password, U.telefono, U.fecha_nacimiento AS fechaNacimiento
          , U.genero, U.rol_id AS rolId, R.nombre AS rolNombre, P.estado_familiar AS estadoFamiliar, P.num_afiliado AS numAfiliado, P.tipo_sangre AS tipoSangre
          , P.alergias, P.condiciones_cronicas AS condicionesCronicas, P.nota_clinica AS notaClinica, P.medicamentos_recurrente AS medicamentosRecurrente
         FROM pacientes P 
          INNER JOIN usuarios U ON U.id = P.usuario_id
		      INNER JOIN roles R ON R.id = U.rol_id
         WHERE P.num_afiliado = $1`,
      [user.numAfiliado],
    );

    // Verificamos si el usuario tiene asignado un (Paciente/Medico)
    if (!result.rows[0]) {
      throw new Error(`No se encontro el paciente.`);
    }

    // Aceptamos cambios
    await client.query("COMMIT");

    // Retornamos el result por default de la db
    return result.rows[0];
  } catch (err) {
    // Salio algo mal hacemos un rollback
    await client.query("ROLLBACK");
    throw err;
  } finally {
    // Liberamos la conexion
    client.release();
  }
};

// Funcion by medico (LOGIN)
exports.findByMedic = async (user) => {
  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    let result = await client.query(
      `SELECT U.id AS usuarioId, U.nombre, U.apellido, U.dui, U.email, U.password_hash AS password, U.telefono, U.fecha_nacimiento AS fechaNacimiento
          , U.genero, U.rol_id AS rolId, R.nombre AS rolNombre, M.num_jvpm AS numJvpm, M.especialidad_id AS especialidadId
          , E.nombre AS especialidadNombre, M.unidad_medica_id AS unidadMedicaId, UM.nombre AS unidadMedicaNombre
         FROM medicos M 
          INNER JOIN usuarios U ON U.id = M.usuario_id
          INNER JOIN roles R ON R.id = U.rol_id
          INNER JOIN especialidades E ON E.id = M.especialidad_id
          INNER JOIN unidades_medicas UM ON UM.id = M.unidad_medica_id
         WHERE M.num_jvpm = $1`,
      [user.numJvpm],
    );

    // Verificamos si el usuario tiene asignado un (Paciente/Medico)
    if (!result.rows[0]) {
      throw new Error(`No se encontro el medico.`);
    }

    // Aceptamos cambios
    await client.query("COMMIT");

    // Retornamos el result por default de la db
    return result.rows[0];
  } catch (err) {
    // Salio algo mal hacemos un rollback
    await client.query("ROLLBACK");
    throw err;
  } finally {
    // Liberamos la conexion
    client.release();
  }
};

exports.findByAdmin = async (user) => {
  // Verificamos si es superAdmin
  if (user?.superAdmin) {
    if (user.superAdmin !== "saludplusadminisss503") {
      const error = Error("No tiene permisos para acceder");
      error.status = 403;
      throw error;
    }
  } else {
    const error = Error("No tiene permisos para acceder");
    error.status = 403;
    throw error;
  }

  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    let result = await client.query(
      `SELECT U.id AS usuarioId, U.nombre, U.apellido, U.dui, U.email, U.password_hash AS password, U.telefono
        , U.fecha_nacimiento AS fechaNacimiento, U.genero, U.rol_id AS rolId, R.nombre AS rolNombre
        FROM usuarios U
		      INNER JOIN roles R ON R.id = U.rol_id
        WHERE U.email = $1`,
      [user.email],
    );

    // Verificamos si el usuario tiene asignado un (Paciente/Medico)
    if (!result.rows[0]) {
      throw new Error(`No se encontro el admin.`);
    }

    // Aceptamos cambios
    await client.query("COMMIT");

    // Retornamos el result por default de la db
    return result.rows[0];
  } catch (err) {
    // Salio algo mal hacemos un rollback
    await client.query("ROLLBACK");
    throw err;
  } finally {
    // Liberamos la conexion
    client.release();
  }
};

// Funcion para crear un Paciente
exports.createPaciente = async (user) => {
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
    estadoFamiliar,
    numAfiliado,
  } = user;

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

    // Lo registramos en la tabla paciente
    response = await client.query(
      `INSERT INTO pacientes (usuario_id, estado_familiar, num_afiliado)
       VALUES ($1,$2,$3)
       RETURNING id AS pacienteId, estado_familiar AS  estadoFamiliar, num_afiliado AS numAfiliado, tipo_sangre AS tipoSangre, alergias,
          condiciones_cronicas AS condicionesCronicas, nota_clinica AS notaClinica, medicamentos_recurrente AS medicamentosRecurrente`,
      [result.usuariosid, estadoFamiliar, numAfiliado],
    );

    // Verificamos si el usuario tiene asignado un (Paciente/Medico)
    if (!response.rows[0]) {
      throw new Error(`No se logro registrar al paciente correctamente.`);
    }

    result = { ...result, ...response.rows[0] };

    // Aceptamos cambios
    await client.query("COMMIT");

    // Retornamos el result por default de la db
    return result;
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

// Funcion para registrar el login
exports.registerLogIn = async (data) => {
  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();
  let logIn = false;
  let result = "";

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    //Verificamos si ya existe otra sesion
    const existLogin = await client.query(
      `SELECT 1 FROM refresh_tokens WHERE usuario_id = $1`,
      [data.usuarioid],
    );

    // // Si existe le decimos que ya esta un usuario con esa sesion
    // if (existLogin.rowCount > 0) {
    //   let error = Error(
    //     "Ya existe una sesion activa con el usuario ingresado.",
    //   );
    //   error.status = 400;
    //   throw error;
    // }

    // Realizamos las inserciones en las tablas
    result = await client.query(
      `INSERT INTO refresh_tokens (usuario_id, expires_at, token_hash)
       VALUES ($1,NOW() + INTERVAL '1 hour',$2)
       RETURNING usuario_id AS usuarioId
      `,
      [data.usuarioid, data.token],
    );

    //Verificamos si se registro el login
    if (!result.rows[0]) {
      throw new Error(`No se logro registrar el inicio de sesion.`);
    }

    // Aceptamos cambios
    await client.query("COMMIT");

    logIn = true;
  } catch (err) {
    //Salio algo mal hacemos un rollback
    await client.query("ROLLBACK");
    logIn = false;
    throw err;
  } finally {
    //Liberamos la conexion
    client.release();
  }

  return logIn;
};

// Funcion para eliminar el registro del login
exports.deleteLogIn = async (data) => {
  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();
  let logOut = false;

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    //Verificamos si ya existe otra sesion
    const existLogin = await client.query(
      `SELECT 1 FROM refresh_tokens WHERE token_hash = $1`,
      [data.token],
    );

    if (!existLogin.rowCount > 0) {
      let error = Error(
        "Ya se habia eliminad una sesion activa con el usuario ingresado.",
      );
      error.status = 400;
      throw error;
    }

    // Realizamos las inserciones en las tablas
    let result = await client.query(
      `DELETE FROM refresh_tokens
       WHERE token_hash = $1
       RETURNING *
      `,
      [data.token],
    );

    //Verificamos si se registro el login
    if (!result.rows[0]) {
      throw new Error(`No se logro eliminar el inicio de sesion.`);
    }

    // Aceptamos cambios
    await client.query("COMMIT");

    logOut = true;
  } catch (err) {
    //Salio algo mal hacemos un rollback
    await client.query("ROLLBACK");
    logOut = false;
    throw err;
  } finally {
    //Liberamos la conexion
    client.release();
  }

  return logOut;
};
