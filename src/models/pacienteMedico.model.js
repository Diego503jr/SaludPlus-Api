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
