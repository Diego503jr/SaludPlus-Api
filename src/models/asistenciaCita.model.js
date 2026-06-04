const pool = require("../config/db");

// Actualizar estado de cita e insertar asistencia
exports.updateAsistido = async (id, asistidoCita, usuarioId) => {
  const { asistio } = asistidoCita;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 0. Resolver el id REAL (integer) del médico a partir del usuario logueado (UUID)
    const resMedico = await client.query(
      "SELECT id FROM medicos WHERE usuario_id = $1::UUID",
      [usuarioId]
    );
    if (resMedico.rows.length === 0) {
      throw new Error("No se encontró un médico asociado a este usuario.");
    }
    const medicoIdReal = resMedico.rows[0].id; // <- este sí es integer

    // 1. Actualizar el estado de la cita
    const resUpdateCita = await client.query(
      `UPDATE citas SET estado_id = 6 WHERE id = $1::UUID RETURNING id;`,
      [id]
    );
    if (resUpdateCita.rowCount === 0) {
      throw new Error(`No se encontró ninguna cita con el ID ${id}.`);
    }

    // 2. Insertar la asistencia con el medico_id integer real
    const query = `
      INSERT INTO asistencias_cita (cita_id, medico_id, asistio, marcado_at)
      VALUES ($1::UUID, $2, $3, NOW())
      RETURNING id         AS asistenciaCitaId,
                cita_id    AS citaId,
                medico_id  AS medicoId,
                marcado_at AS marcadoAt,
                asistio;`;

    const response = await client.query(query, [id, medicoIdReal, asistio]);

    if (response.rowCount === 0) {
      throw new Error(`No se pudo registrar la asistencia para la cita ${id}.`);
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