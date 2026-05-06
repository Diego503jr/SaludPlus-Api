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
