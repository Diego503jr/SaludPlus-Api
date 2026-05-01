const pool = require("../config/db");

exports.updateHistorialPaciente = async (id, historial) => {
  const { tipoSangre, alergias, condicionesCronicas, notaClinica, medicamentosRecurrentes } = historial;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    
    const query = `
      UPDATE Pacientes
        SET tipo_sangre = $1,
        alergias = $2,
        condiciones_cronicas = $3,
        nota_clinica = $4,
        medicamentos_recurrente = $5
        WHERE id = $6
      RETURNING 
      id AS pacienteId,
      usuario_id AS "usuarioId",
      estado_familiar AS "estadoFamiliar",
      num_afiliado AS "numAfiliado",
      tipo_sangre AS "tipoSangre",
      alergias,
      condiciones_cronicas AS "condicionesCronicas",
      nota_clinica AS "notaClinica",
      medicamentos_recurrente AS "medicamentosRecurrente";`;

    const values = [tipoSangre, alergias, condicionesCronicas, notaClinica, medicamentosRecurrentes, id];

    const response = await client.query(query, values);

    if (response.rowCount === 0) {
      throw new Error(`No se pudo actualizar el paciente con id ${id}.`);
    }

    await client.query("COMMIT");
    return response.rows[0];

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};