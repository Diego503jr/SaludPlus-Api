const pool = require("../config/db");

// Funcion para obtener el usuario por medio del email (SELECTWHERE)
exports.findByEmail = async (data) => {
  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Variables para retornar las columnas necesarias
    let result = {};

    // Iniciamos la transaccion
    await client.query("BEGIN");

    // Realizamos las consultas requeridas
    let response = await client.query(
      `SELECT U.id, U.nombre, U.apellido, U.dui, U.email, U.password_hash AS password, U.telefono,
           U.fecha_nacimiento AS fechaNacimiento, U.genero, U.rol_id AS rolId, U.activo 
       FROM usuarios U WHERE U.email = $1 AND U.activo = True`,
      [data.email],
    );

    // Verificamos si existe el usuario
    if (!response.rows[0]) {
      throw new Error(`No existe el usuario con ese correo electronico.`);
    }

    // Seteamos los valores del usuario
    result = response.rows[0];

    // Verificamos si es Paciente o Medico para hacer el select a la tabla correspondiente
    if (data.rol == 1) {
      response = await client.query(
        `SELECT P.estado_familiar AS estadoFamiliar, P.num_afiliado AS numAfiliado, P.tipo_sangre AS tipoSangre, 
            P.alergias, P.condiciones_cronicas AS condicionesCronicas, P.nota_clinica AS notaClinica, P.medicamentos_recurrente AS medicamentosRecurrente 
         FROM pacientes P WHERE P.usuario_id = $1`,
        [result.id],
      );
    } else {
      response = await client.query(
        `SELECT M.num_jvpm AS numJvpm, M.especialidad_id AS especialidadId, M.unidad_medica_id AS unidadMedicaId 
         FROM medicos M WHERE M.usuario_id = $1`,
        [result.id],
      );
    }

    // Verificamos si el usuario tiene asignado un (Paciente/Medico)
    if (!response.rows[0]) {
      throw new Error(
        `El usuario no tiene ${data.rol == 1 ? "paciente" : "medico"} asociado.`,
      );
    }

    result = { ...result, ...response.rows[0] };

    // Aceptamos cambios
    await client.query("COMMIT");

    // Retornamos el result por default de la db
    return result;
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
       RETURNING id, nombre, apellido, dui, email, telefono, fecha_nacimiento AS fechaNacimiento, genero, rol_id AS rolId`,
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
       RETURNING estado_familiar AS  estadoFamiliar, num_afiliado AS numAfiliado, tipo_sangre AS tipoSangre, alergias,
          condiciones_cronicas AS condicionesCronicas, nota_clinica AS notaClinica, medicamentos_recurrente AS medicamentosRecurrente`,
      [result.id, estadoFamiliar, numAfiliado],
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
    throw err;
  } finally {
    // Liberamos la conexion
    client.release();
  }
};

//Funcion para crear un Medico
exports.createMedico = async (data) => {
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
       RETURNING id, nombre, apellido, dui, email, telefono, fecha_nacimiento AS fechaNacimiento, genero, rol_id AS rolId`,
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
       RETURNING num_jvpm AS numJvpm, especialidad_id AS especialidadId, unidad_medica_id AS unidadMedicaId`,
      [result.id, numJvpm, especialidad, unidadMedica],
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
    throw err;
  } finally {
    //Liberamos la conexion
    client.release();
  }
};
