const pool = require("../config/db");

// Actualizar estado de cita e insertar asistencia
exports.updateAsistido = async (id, asistidoCita, medicoId) => {
  const { asistio } = asistidoCita;
  const client = await pool.connect();

  try {
    // Inicio de transacción
    await client.query("BEGIN");

    const resUpdateCita = await client.query(
      `UPDATE citas SET estado_id = 6 WHERE id = $1::UUID RETURNING id;`,
      [id]
    );

    // Si rowCount es 0 significa que ese UUID de cita no existe en la base de datos
    if (resUpdateCita.rowCount === 0) {
      throw new Error(`No se encontró ninguna cita con el ID ${id}.`);
    }

    const query = `
      INSERT INTO asistencias_cita (cita_id, medico_id, asistio, marcado_at)
      VALUES ($1::UUID, $2::UUID, $3, NOW())
      RETURNING id         AS asistenciaCitaId,
                cita_id    AS citaId,
                medico_id  AS medicoId,
                marcado_at AS marcadoAt,
                asistio;`;

    // Sin parseInt: el medicoId es un UUID, se manda tal cual
    const response = await client.query(query, [id, medicoId, asistio]);

    // No existe el id o no coincide con filtros
    if (response.rowCount === 0) {
      throw new Error(
        `No se pudo registrar la asistencia para la cita ${id}.`,
      );
    }

    // Confirmamos cambios si fue exitoso
    await client.query("COMMIT");
    return response.rows[0];
  } catch (err) {
    // Si algo falla, revertimos
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};