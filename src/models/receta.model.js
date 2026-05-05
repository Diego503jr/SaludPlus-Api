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
      throw new Error(`No se encontró una cita asociada al paciente con id ${pacienteId}.`);
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