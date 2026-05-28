const pool = require("../config/db");

// OBTENER PRÓXIMAS CITAS DEL PACIENTE (Pendientes o Confirmadas)
exports.obtenerProximasPorPaciente = async (idPaciente) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
          c.id AS cita_id,
          e.nombre AS especialidad,
          c.fecha_solicitada,
          c.hora_asignada,
          um.nombre AS unidad_medica,
          u.nombre AS doctor_nombre,
          u.apellido AS doctor_apellido
      FROM citas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      INNER JOIN estados_cita ec ON c.estado_id = ec.id
      INNER JOIN especialidades e ON c.especialidad_id = e.id
      INNER JOIN unidades_medicas um ON c.unidad_medica_id = um.id
      LEFT JOIN medicos m ON c.medico_id = m.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE p.usuario_id = $1
        AND ec.nombre IN ('pendiente', 'confirmada')
      ORDER BY c.fecha_solicitada ASC, c.hora_asignada ASC;
    `;

    const response = await client.query(query, [idPaciente]);

    if (response.rows.length === 0) {
      return [];
    }

    return response.rows;
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// PASO 3 (SOLICITAR CITA): MODELOS PARA HORARIOS

// 3.1 Obtener la hora a la que abre y cierra la unidad en un día específico
exports.obtenerHorarioApertura = async (unidadId, diaSemana) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT hora_inicio, hora_fin 
      FROM horarios_unidad 
      WHERE unidad_medica_id = $1 AND dia_semana = $2;
    `;
    const response = await client.query(query, [unidadId, diaSemana]);
    return response.rows[0]; // Retorna un solo registro
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// 3.2 Obtener las horas que YA están ocupadas por otros pacientes ese día
exports.obtenerHorasOcupadas = async (unidadId, especialidadId, fecha) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT c.hora_asignada 
      FROM citas c
      INNER JOIN estados_cita ec ON c.estado_id = ec.id
      WHERE c.unidad_medica_id = $1 
        AND c.especialidad_id = $2 
        AND c.fecha_solicitada = $3
        -- Solo tomamos en cuenta las citas que siguen en pie
        AND ec.nombre IN ('pendiente', 'confirmada', 'reprogramada');
    `;
    const response = await client.query(query, [
      unidadId,
      especialidadId,
      fecha,
    ]);
    // Extraemos solo un arreglo con las horas ej. ['08:00:00', '09:30:00']
    return response.rows.map((fila) => fila.hora_asignada);
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// HISTORIAL DE CITAS: OBTENER TODAS LAS CITAS DEL PACIENTE
exports.obtenerHistorialPaciente = async (idUsuario) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
          c.id AS cita_id,
          c.especialidad_id,
          c.unidad_medica_id,
          e.nombre AS especialidad,
          c.fecha_solicitada,
          c.hora_asignada,
          um.nombre AS unidad_medica,
          ec.nombre AS estado,
          u_med.nombre AS doctor_nombre,
          u_med.apellido AS doctor_apellido
      FROM citas c
      -- UNIMOS con pacientes para poder filtrar por usuario_id
      INNER JOIN pacientes p ON c.paciente_id = p.id
      INNER JOIN especialidades e ON c.especialidad_id = e.id
      INNER JOIN unidades_medicas um ON c.unidad_medica_id = um.id
      INNER JOIN estados_cita ec ON c.estado_id = ec.id
      LEFT JOIN medicos m ON c.medico_id = m.id
      LEFT JOIN usuarios u_med ON m.usuario_id = u_med.id
      -- FILTRAMOS usando el usuario_id que viene de la app móvil
      WHERE p.usuario_id = $1
      ORDER BY c.fecha_solicitada DESC;
    `;

    const response = await client.query(query, [idUsuario]);
    return response.rows;
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// ==========================================
// MAPA DE UNIDADES: OBTENER DATOS Y ESPECIALIDADES
// ==========================================
exports.obtenerUnidadesParaMapa = async () => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
          um.id, 
          um.nombre, 
          um.direccion, 
          um.telefono, 
          um.latitud, 
          um.longitud,
          ARRAY_AGG(e.nombre) FILTER (WHERE e.nombre IS NOT NULL) AS especialidades
      FROM unidades_medicas um
      LEFT JOIN unidad_especialidad ue ON um.id = ue.unidad_medica_id AND ue.activo = true
      LEFT JOIN especialidades e ON ue.especialidad_id = e.id AND e.activo = true
      WHERE um.activo = true
      GROUP BY um.id
      ORDER BY um.nombre ASC;
    `;

    const response = await client.query(query);
    return response.rows;
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

//GET TODAS LAS CITAS DEL MÉDICO LOGEADO
exports.GetAppointments = async (id) => {
  const client = await pool.connect();

  try {
    //Consulta para obtener información de paciente, usuario, especialidad y estados
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

    //Ejecutamos con id de médico autenticado
    const response = await client.query(query, [id]);

    // Validamos si tiene citas pendientes o activas
    if (response.rows.length === 0) {
      throw new Error(`No hay citas disponibles: ${id}`);
    }

    //Retornamos el listado completo de citas
    return response.rows;
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// ==========================================
// GUARDAR CITA (POST)
// ==========================================
exports.crearCita = async (datos) => {
  const client = await pool.connect();
  try {
    // Buscamos el ID real del paciente usando el usuario_id
    const resPaciente = await client.query(
      "SELECT id FROM pacientes WHERE usuario_id = $1",
      [datos.usuario_id],
    );

    if (resPaciente.rows.length === 0) {
      throw new Error("No se encontró un paciente asociado a este usuario");
    }

    const pacienteIdReal = resPaciente.rows[0].id;

    const query = `
            INSERT INTO citas (
                paciente_id, especialidad_id, unidad_medica_id, 
                fecha_solicitada, hora_asignada, motivo_consulta, estado_id
            ) VALUES ($1, $2, $3, $4, $5, $6, (SELECT id FROM estados_cita WHERE nombre = 'pendiente'))
            RETURNING id;
        `;

    const values = [
      pacienteIdReal,
      datos.especialidad_id,
      datos.unidad_medica_id,
      datos.fecha_solicitada,
      datos.hora_asignada,
      datos.motivo_consulta,
    ];

    const response = await client.query(query, values);
    return response.rows[0];
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// REPORTE DE HISTORICO DE CITAS
exports.historicoCitas = async (id) => {
  // Abrimos la conexion a la db para hacer uso de las transacciones por si algo paso mal
  const client = await pool.connect();

  try {
    // Iniciamos la transaccion
    await client.query("BEGIN");

    let result = await client.query(
      `SELECT 
            C.id,
            C.paciente_id        AS pacienteId,
            C.medico_id          AS medicoId,
            C.unidad_medica_id   AS unidadMedicaId,
            C.especialidad_id    AS especialidadId,
            C.fecha_solicitada   AS fechaSolicitada,
            C.hora_asignada      AS horaAsignada,
            C.estado_id          AS estadoId,
            C.motivo_consulta    AS motivoConsulta,
            -- Flags
            CASE WHEN AC.marcado_at   IS NOT NULL AND AC.asistio = TRUE THEN 1 ELSE 0 END AS asistida,
            CASE WHEN HC.cancelado_at IS NOT NULL                       THEN 1 ELSE 0 END AS cancelada,
            CASE WHEN C.cita_origen_id IS NOT NULL                      THEN 1 ELSE 0 END AS reprogramada,
            CASE WHEN AC.id IS NULL AND HC.id IS NULL                   THEN 1 ELSE 0 END AS noAsistida
        FROM citas C
            LEFT JOIN asistencias_cita AC        ON AC.cita_id = C.id
            LEFT JOIN historial_cancelaciones HC ON HC.cita_id = C.id
        WHERE C.unidad_medica_id = $1
        ORDER BY C.fecha_solicitada DESC, C.hora_asignada DESC;`,
      [id],
    );

    // Aceptamos cambios
    await client.query("COMMIT");

    // Verificamos si hay historico de citas
    if (!result.rows[0]) {
      throw new Error(`No se encontraron las citas.`);
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

// HISTORICO COMPLETO DE CITAS POR PACIENTE (TODOS LOS CAMPOS)
exports.historicoCitasPorPaciente = async (idPaciente) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const query = `
      SELECT 
          -- Datos completos de la cita
          C.id                          AS cita_id,
          C.paciente_id,
          C.medico_id,
          C.unidad_medica_id,
          C.especialidad_id,
          C.fecha_solicitada,
          C.hora_asignada,
          C.estado_id,
          C.motivo_consulta,
          C.observaciones_medico,
          C.cita_origen_id,

          -- Datos del paciente
          UP.nombre                     AS paciente_nombre,
          UP.apellido                   AS paciente_apellido,
          UP.dui                        AS paciente_dui,
          P.num_afiliado                AS paciente_num_afiliado,

          -- Datos del médico (puede ser NULL si no se ha asignado)
          UM_DOC.nombre                 AS medico_nombre,
          UM_DOC.apellido               AS medico_apellido,
          M.num_jvpm                    AS medico_jvpm,

          -- Especialidad
          E.nombre                      AS especialidad_nombre,

          -- Unidad médica
          U.nombre                      AS unidad_medica_nombre,
          U.direccion                   AS unidad_medica_direccion,
          U.telefono                    AS unidad_medica_telefono,

          -- Estado de la cita
          EC.nombre                     AS estado_nombre,

          -- Flags de seguimiento
          CASE WHEN AC.marcado_at IS NOT NULL AND AC.asistio = TRUE THEN 1 ELSE 0 END AS asistida,
          CASE WHEN HC.cancelado_at IS NOT NULL THEN 1 ELSE 0 END                     AS cancelada,
          CASE WHEN C.cita_origen_id IS NOT NULL THEN 1 ELSE 0 END                    AS reprogramada,
          CASE WHEN AC.id IS NULL AND HC.id IS NULL THEN 1 ELSE 0 END                 AS no_asistida,

          -- Detalles de asistencia y cancelación (si existen)
          AC.marcado_at                 AS asistencia_marcada_at,
          HC.motivo                     AS cancelacion_motivo,
          HC.cancelado_at               AS cancelacion_at
      FROM citas C
      INNER JOIN pacientes P              ON C.paciente_id = P.id
      INNER JOIN usuarios UP              ON P.usuario_id = UP.id
      INNER JOIN especialidades E         ON C.especialidad_id = E.id
      INNER JOIN unidades_medicas U       ON C.unidad_medica_id = U.id
      INNER JOIN estados_cita EC          ON C.estado_id = EC.id
      LEFT  JOIN medicos M                ON C.medico_id = M.id
      LEFT  JOIN usuarios UM_DOC          ON M.usuario_id = UM_DOC.id
      LEFT  JOIN asistencias_cita AC      ON AC.cita_id = C.id
      LEFT  JOIN historial_cancelaciones HC ON HC.cita_id = C.id
      WHERE C.paciente_id = $1
      ORDER BY C.fecha_solicitada DESC, C.hora_asignada DESC;
    `;

    const result = await client.query(query, [idPaciente]);
    await client.query("COMMIT");

    return result.rows;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// ==========================================
// ACTUALIZAR ESTADO DE CITA
// ==========================================
// ==========================================
// ACTUALIZAR CITA (PATCH ÚNICO): CANCELAR O REPROGRAMAR
// ==========================================
exports.actualizarEstadoCita = async (idCita, datos) => {
  const client = await pool.connect();
  try {
    const query = `
      UPDATE citas 
      SET estado_id = COALESCE($1, estado_id),
          fecha_solicitada = COALESCE($2, fecha_solicitada),
          hora_asignada = COALESCE($3, hora_asignada)
      WHERE id = $4
      RETURNING id;
    `;

    const values = [
      datos.estado_id,
      datos.fecha_solicitada,
      datos.hora_asignada,
      idCita,
    ];

    const response = await client.query(query, values);
    return response.rows[0];
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};
