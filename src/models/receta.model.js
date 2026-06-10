const pool = require("../config/db");

//FUNCIÓN PARA CREAR RECETA
exports.createReceta = async (pacienteId, medicoId, observaciones) => {
  const client = await pool.connect();

  try {
    //Inicio de transacción
    await client.query("BEGIN");

    //Consulta para la creación de receta
    const query = `
    INSERT INTO recetas (cita_id, medico_id, paciente_id, fecha, observaciones)
    VALUES (
        (
            SELECT id FROM citas 
            WHERE paciente_id = $1::INT 
            AND estado_id NOT IN (
                SELECT id FROM estados_cita 
                WHERE nombre IN ('cancelada_paciente', 'cancelada_sistema', 'atendida')
            )
            ORDER BY fecha_solicitada DESC, hora_asignada DESC
            LIMIT 1
        ), 
        (SELECT id FROM medicos WHERE usuario_id = $2::UUID), 
        $1::INT, 
        CURRENT_DATE, 
        $3
    )
    RETURNING id AS recetaId, cita_id AS citaId, medico_id AS medicoId, fecha, observaciones;`;

    const values = [pacienteId, medicoId, observaciones];

    //Ejecutamos consulta enviando información
    const response = await client.query(query, values);

    //Si no se encuentra cita por paciente
    if (response.rowCount === 0) {
      throw new Error(
        `No se encontró una cita asociada al paciente con id ${pacienteId}.`,
      );
    }

    //Confirmación de cambios
    await client.query("COMMIT");

    //Retornamos objeto creado
    return response.rows[0];
  } catch (err) {
    //Rollback si falla la creación
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// FUNCION para obtener los datos de las citas por cita Id
exports.getCitaById = async (citaId) => {
  const client = await pool.connect();

  try {
    // Variables para retornar las columnas necesarias
    let result = {};

    //Inicio de transacción
    await client.query("BEGIN");

    let query = `SELECT U.nombre AS medico_nombre, U.apellido, U.telefono,
                  E.nombre AS especialidad, R.fecha, R.especialidades,
                  MED.nombre_generico, MED.forma_farmaceutica, MED.concentracion,
                  RM.dosis, RM.duracion_dias, RM.cantidad, RM.intrucciones
                 FROM recetas R
                  INNER JOIN receta_medicamento RM ON RM.receta_id = R.id
                  INNER JOIN medicamentos MED ON MED.id = RM.medicamento_id
                  LEFT JOIN medicos M ON M.id = R.medico_id
                  INNER JOIN especialidades E ON E.id = M.especialidad_id
                  INNER JOIN usuarios U ON U.id = M.usuario_id
                 WHERE R.cita_id = $1`;

    //Ejecutamos consulta enviando información
    const response = await client.query(query, [citaId]);

    // Verificamos si se registro el usuario
    if (!response.rows[0]) {
      throw new Error(`No logró obtener la cita.`);
    }

    // Seteamos los valores del usuario
    result = response.rows[0];

    //Confirmación de cambios
    await client.query("COMMIT");

    //Retornamos objeto creado
    return result;
  } catch (err) {
    //Rollback si falla la creación
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
