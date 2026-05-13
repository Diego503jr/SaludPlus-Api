const pool = require("../config/db");

//GET INFORMACIÓN PACIENTE ID
exports.GetPatientInfo = async (id) => {
  const client = await pool.connect();

  try {
    //Consulta para obtener información personal e historia clinica
    const query = `
        SELECT 
          U.nombre,
          U.apellido,
          U.fecha_nacimiento AS "fechaNacimiento",
          U.genero AS "generoId",
          P.id AS "idPaciente",
          P.tipo_sangre AS "tipoSangre",
          P.alergias,
          P.condiciones_cronicas AS "condicionesCronicas",
          P.nota_clinica AS "notaClinica",
          P.medicamentos_recurrente AS "medicamentosRecurrentes",
           (
                SELECT to_char(MAX(AC.marcado_at), 'DD/MM/YYYY HH24:MI') 
                FROM asistencias_cita AC
                INNER JOIN citas C ON AC.cita_id = C.id
                WHERE C.paciente_id = P.id 
                  AND AC.asistio = TRUE
            ) AS "ultimaVisita"
        FROM pacientes P
        INNER JOIN usuarios U ON P.usuario_id = U.id
        WHERE P.id = $1`;

    //Ejecutamos consulta con id de paciente
    const response = await client.query(query, [id]);

    // Si no hay filas, el paciente no existe
    if (response.rows.length === 0) {
      throw new Error(`No existe el paciente con el ID: ${id}`);
    }

    return response.rows[0];
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// Funcion para obtener todos los clientes
exports.read = async () => {
  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    let result = await client.query(
      `SELECT U.id AS usuarioId, U.nombre, U.apellido, U.dui, U.email, U.telefono, U.fecha_nacimiento AS fechaNacimiento
          , U.genero, U.rol_id AS rolId, U.activo, P.id, P.estado_familiar AS estadoFamiliar, P.num_afiliado AS numAfiliado, P.tipo_sangre AS tipoSangre
          , P.alergias, P.condiciones_cronicas AS condicionesCronicas, P.nota_clinica AS notaClinica, P.medicamentos_recurrente AS medicamentosRecurrente
         FROM pacientes P 
          LEFT JOIN usuarios U ON U.id = P.usuario_id`,
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

// Funcion para actualizar paciente
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
    estadoFamiliar,
    numAfiliado,
    tipoSangre,
    alergias,
    condicionesCronicas,
    notaClinica,
    medicamentosRecurrentes,
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

    // Actualizamos la tabla pacientes
    response = await client.query(
      `UPDATE pacientes 
     SET estado_familiar = $1,
         num_afiliado = $2,
         tipo_sangre = $3,
         alergias = $4,
         condiciones_cronicas = $5,
         nota_clinica = $6,
         medicamentos_recurrente = $7
     WHERE usuario_id = $8
     RETURNING id AS "idPaciente", 
               estado_familiar AS "estadoFamiliar",
               num_afiliado AS "numAfiliado",
               tipo_sangre AS "tipoSangre", 
               alergias, 
               condiciones_cronicas AS "condicionesCronicas", 
               nota_clinica AS "notaClinica", 
               medicamentos_recurrente AS "medicamentosRecurrentes"`,
      [
        estadoFamiliar,
        numAfiliado,
        tipoSangre,
        alergias,
        condicionesCronicas,
        notaClinica,
        medicamentosRecurrentes,
        result.usuariosid,
      ],
    );

    if (!response.rows[0]) {
      throw new Error(`No se encontró el paciente para actualizar.`);
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

// Funcion para pasar a inactivo al paciente
exports.delete = async (id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Solo cambiamos el activo a false en la tabla usuarios
    const result = await client.query(
      `UPDATE usuarios 
         SET activo = false
       WHERE id = $1
       RETURNING id AS usuarioId, activo`,
      [id],
    );

    // Verificamos que el usuario exista
    if (!result.rows[0]) {
      throw new Error(`No se encontró el usuario.`);
    }

    await client.query("COMMIT");

    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// EDITAR PERFIL: MODELO
exports.actualizarPerfil = async (idUsuario, datos) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    //Obtener el ID del paciente desde el usuario_id
    const pacRes = await client.query(
        'SELECT id FROM pacientes WHERE usuario_id = $1', 
        [idUsuario]
    );

    if (pacRes.rows.length === 0) throw new Error('Paciente no encontrado');
    const idPaciente = pacRes.rows[0].id;

    // Actualizar tabla usuarios (teléfono)
    await client.query(
        'UPDATE usuarios SET telefono = COALESCE($1, telefono) WHERE id = $2',
        [datos.telefono, idUsuario]
    );

    // Actualizar tabla pacientes (alergias y condiciones)
    await client.query(
        'UPDATE pacientes SET alergias = COALESCE($1, alergias), condiciones_cronicas = COALESCE($2, condiciones_cronicas) WHERE id = $3',
        [datos.alergias, datos.condiciones_cronicas, idPaciente]
    );

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
