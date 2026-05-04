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
      INNER JOIN estados_cita ec ON c.estado_id = ec.id
      INNER JOIN especialidades e ON c.especialidad_id = e.id
      INNER JOIN unidades_medicas um ON c.unidad_medica_id = um.id
      LEFT JOIN medicos m ON c.medico_id = m.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE c.paciente_id = $1 
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


// PASO 1 (SOLICITAR CITA): OBTENER ESPECIALIDADES ACTIVAS
exports.obtenerEspecialidadesActivas = async () => {
  const client = await pool.connect();

  try {

    const query = `
      SELECT id, nombre, descripcion 
      FROM especialidades 
      WHERE activo = true
      ORDER BY nombre ASC;
    `;

    const response = await client.query(query);
    return response.rows;

  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// PASO 2 (SOLICITAR CITA): OBTENER UNIDADES MÉDICAS POR ESPECIALIDAD
exports.obtenerUnidadesPorEspecialidad = async (idEspecialidad) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
          um.id, 
          um.nombre, 
          um.direccion 
      FROM unidades_medicas um
      INNER JOIN unidad_especialidad ue ON um.id = ue.unidad_medica_id
      WHERE ue.especialidad_id = $1 
        AND um.activo = true 
        AND ue.activo = true
      ORDER BY um.nombre ASC;
    `;

    const response = await client.query(query, [idEspecialidad]);
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
    const response = await client.query(query, [unidadId, especialidadId, fecha]);
    // Extraemos solo un arreglo con las horas ej. ['08:00:00', '09:30:00']
    return response.rows.map(fila => fila.hora_asignada); 
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// HISTORIAL DE CITAS: OBTENER TODAS LAS CITAS DEL PACIENTE
exports.obtenerHistorialCompleto = async (idPaciente) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
          c.id AS cita_id,
          ec.nombre AS estado,
          e.nombre AS especialidad,
          c.fecha_solicitada,
          c.hora_asignada,
          um.nombre AS unidad_medica,
          u.nombre AS doctor_nombre,
          u.apellido AS doctor_apellido
      FROM citas c
      INNER JOIN estados_cita ec ON c.estado_id = ec.id
      INNER JOIN especialidades e ON c.especialidad_id = e.id
      INNER JOIN unidades_medicas um ON c.unidad_medica_id = um.id
      LEFT JOIN medicos m ON c.medico_id = m.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE c.paciente_id = $1
      ORDER BY c.fecha_solicitada DESC, c.hora_asignada DESC;
    `;

    const response = await client.query(query, [idPaciente]);
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

// PERFIL DEL PACIENTE: OBTENER DATOS GENERALES Y MÉDICOS
exports.obtenerPerfilPaciente = async (idPaciente) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
          u.nombre, 
          u.apellido, 
          u.dui, 
          u.email, 
          u.telefono,
          p.num_afiliado, 
          p.tipo_sangre, 
          p.alergias, 
          p.condiciones_cronicas
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = $1;
    `;

    const response = await client.query(query, [idPaciente]);
    return response.rows[0]; // Retornamos solo un objeto, no un arreglo

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

// ==========================================
// GUARDAR CITA (POST)
// ==========================================
exports.crearCita = async (citaData) => {
  const client = await pool.connect();

  try {
    const query = `
      INSERT INTO citas (
        paciente_id, 
        especialidad_id, 
        unidad_medica_id, 
        fecha_solicitada, 
        hora_asignada, 
        motivo_consulta, 
        estado_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 
        (SELECT id FROM estados_cita WHERE nombre = 'pendiente')
      ) RETURNING *;
    `;
    
    const values = [
      citaData.paciente_id,
      citaData.especialidad_id,
      citaData.unidad_medica_id,
      citaData.fecha_solicitada,
      citaData.hora_asignada,
      citaData.motivo_consulta
    ];

    const response = await client.query(query, values);
    return response.rows[0];

  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

// ==========================================
// EDITAR PERFIL (PUT): ACTUALIZAR USUARIO Y PACIENTE
// ==========================================
exports.actualizarPerfil = async (idPaciente, datos) => {
  const client = await pool.connect();

  try {
    // Iniciamos la transacción: Si una tabla falla, la otra no se actualiza
    await client.query('BEGIN');

    // 1. Primero averiguamos cuál es el ID del usuario ligado a este paciente
    const userQuery = 'SELECT usuario_id FROM pacientes WHERE id = $1';
    const userRes = await client.query(userQuery, [idPaciente]);

    if (userRes.rows.length === 0) {
        throw new Error('Paciente no encontrado');
    }
    const idUsuario = userRes.rows[0].usuario_id;

    // 2. Actualizamos la tabla 'usuarios' (solo telefono)
    const updateUsuario = `
      UPDATE usuarios 
      SET telefono = COALESCE($1, telefono)
      WHERE id = $2;
    `;
    await client.query(updateUsuario, [datos.telefono, idUsuario]);

   // 3. Actualizamos la tabla 'pacientes' (alergias y condiciones)
    const updatePaciente = `
      UPDATE pacientes 
      SET alergias = COALESCE($1, alergias),
          condiciones_cronicas = COALESCE($2, condiciones_cronicas)
      WHERE id = $3;
    `;
    // Pasamos solo 3 parámetros ahora
    await client.query(updatePaciente, [datos.alergias, datos.condiciones_cronicas, idPaciente]);

    // Si todo salió bien, guardamos los cambios definitivamente
    await client.query('COMMIT');
    return true;

  } catch (err) {
    // Si algo falló, deshacemos cualquier cambio a la mitad para evitar datos corruptos
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};