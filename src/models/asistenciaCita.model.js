const pool = require("../config/db");

//Actualizar estado de cita (bool)
exports.updateAsistido = async (id, asistidoCita) => {
  const { asistio } = asistidoCita;
  const client = await pool.connect();

  try {
    //Inicio de transacción
    await client.query("BEGIN");

    //Actualizamos el estado de la cita
    await client.query(`UPDATE citas SET estado_id = 6 WHERE id = $1::UUID`, [
      id,
    ]);

    //Consulta Update en tabla asistecia cita
    const query = `
      INSERT INTO asistencias_cita (cita_id, medico_id, asistio, marcado_at)
      VALUES ($1::UUID, $2::UUID, $3, NOW())
      RETURNING id         AS asistenciaCitaId,
                cita_id    AS citaId,
                medico_id  AS medicoId,
                marcado_at AS marcadoAt,
                asistio;`;

    const response = await client.query(query, [id, medicoId, asistio]);

    //No existe el id o no coincide con filtros
    if (response.rowCount === 0) {
      throw new Error(
        `No se pudo registrar la asistencia para la cita ${id}.`,
      );
    }

    //Confirmamos cambios si fue exitoso
    await client.query("COMMIT");
    return response.rows[0];
  } catch (err) {
    //Si algo falla, revertimos
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
