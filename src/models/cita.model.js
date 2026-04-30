const pool = require("../config/db");

//GET TODAS LAS CITAS DEL MÉDICO LOGEADO
exports.GetAppointments = async (id) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
          P.id AS pacienteId,
          U.nombre AS nombrePaciente, 
          U.apellido AS apellidoPaciente,
          C.medico_id AS medicoId, 
          M.usuario_id AS medicoUsuarioId, 
          EC.nombre AS estadoCita, 
          C.especialidad_id AS especialidadId,
          E.nombre AS especialidadCita,
          C.hora_asignada AS horaAsignada
      FROM Citas C
      INNER JOIN pacientes P ON C.paciente_id = P.id
      INNER JOIN usuarios U ON P.usuario_id = U.id
      INNER JOIN especialidades E ON C.especialidad_id = E.id 
      INNER JOIN estados_cita EC ON C.estado_id = EC.id
      INNER JOIN medicos M ON C.medico_id = M.id 
      WHERE M.usuario_id = $1 
        AND EC.nombre NOT IN ('cancelada_sistema', 'atendida'); 
`;

    const response = await client.query(query, [id]);

    // Si no hay filas
    if (response.rows.length === 0) {
        throw new Error(`No hay citas disponibles: ${id}`);
    }

    return response.rows;

  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};