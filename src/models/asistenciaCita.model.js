const pool = require("../config/db");

exports.updateAsistido = async (id, asistidoCita) => {
  const { asistio } = asistidoCita;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    
    const query = `
      UPDATE asistencias_cita AS AC
      SET asistio = $1
      FROM citas AS C
      WHERE AC.cita_id = C.id
        AND AC.cita_id = $2::UUID
      RETURNING AC.*;`;

    const values = [asistio, id];

    const response = await client.query(query, values);

    if (response.rowCount === 0) {
      throw new Error(`No se pudo actualizar la asistencia para la cita ${id}.`);
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