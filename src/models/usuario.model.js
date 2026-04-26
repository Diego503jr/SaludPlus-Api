const pool = require("../config/db");

//Funcion para obtener el usuario por medio del email (SELECTWHERE)
exports.findByEmail = async (data) => {
  //Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    // Variables para retornar las columnas necesarias
    let result = {};

    //Le pasamos el email como parametro
    let response = await client.query(
      "SELECT U.id, U.num_afiliado AS noAFiliado, U.nombre, U.apellido, U.email, U.password_hash AS password, U.telefono, U.fecha_nacimiento AS fecNacimiento, U.genero, U.rol_id AS rolId FROM usuarios U WHERE U.email = $1 AND U.activo = True",
      [data.email],
    );

    // Le seteamos las columnas que tiene el usuario
    result = response.rows[0];

    //Verificamos si es Paciente o Medico para hacer el select a la tabla correspondiente
    if (data.rol == 1) {
      response = await client.query(
        `SELECT M.num_jvpm AS noJVPM, M.especialidad_id AS especialidadId,  M.unidad_medica_id AS unidadMedicaId FROM medicos M WHERE M.usuario_id = $1`,
        [result.id],
      );
    } else {
      response = await client.query(
        `SELECT M.num_jvpm AS noJVPM, M.especialidad_id AS especialidadId,  M.unidad_medica_id AS unidadMedicaId FROM medicos M WHERE M.usuario_id = $1`,
        [result.id],
      );
    }

    // Verificamos si existe el usuario en alguna de las tablas medico o paciente
    if (response.rows[0]) {
      result = { ...result, ...response.rows[0] };
    } else {
      throw new Error(
        `El usuario no tiene ${data.rol == 1 ? "Paciente" : "Medico"} asociado`,
      );
    }

    await client.query("COMMIT");

    // //Retornamos el result por default de la db
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

//Funcion para crear un usuario (CREATE)
exports.create = async (user) => {
  //hacemos un destructuring del objeto que traemos de user
  const {
    noAfiliado,
    nombre,
    apellido,
    email,
    password,
    telefono,
    fechanacimiento,
    genero,
    rol_id,
  } = user;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO usuarios (num_afiliado, nombre, apellido, email, password_hash, telefono, fecha_nacimiento, genero, rol_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
     RETURNING num_afiliado AS noAFiliado, nombre, apellido, email, telefono, fecha_nacimiento AS fecNacimiento, genero, rol_id AS rolId`,
      [
        noAfiliado,
        nombre,
        apellido,
        email,
        password,
        telefono,
        fechanacimiento,
        genero,
        rol_id,
      ],
    );

    await client.query("COMMIT");

    //Retornamos el result por default de la db
    return result.rows[0];
  } catch (err) {
    //Salio algo mal hacemos un rollback
    await client.query("ROLLBACK");
    throw err;
  } finally {
    //Liberamos la conexion
    client.release();
  }
};

//Funcion para actualizar un usuario (UPDATE) f
