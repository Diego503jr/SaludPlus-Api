const pool = require("../config/db");

//Actualizar estado de cita (bool)
exports.updateAsistido = async (id, asistidoCita) => {
  const { asistio } = asistidoCita;
  const client = await pool.connect();

  try {
    //Inicio de transacción 
    await client.query("BEGIN");
    
    //Consulta Update en tabla asistecia cita
    const query = `
      UPDATE asistencias_cita AS AC
      SET asistio = $1
      FROM citas AS C
      WHERE AC.cita_id = C.id
        AND AC.cita_id = $2::UUID
      RETURNING AC.id AS asistenciaCitaId, AC.cita_id AS citaId, AC.medico_id AS medicoId, AC.marcado_at AS marcadoAt, AC.asistio;`;

    const values = [asistio, id];

    //Ejecución de actualización con estado y el Id
    const response = await client.query(query, values);

    //No existe el id o no coincide con filtros
    if (response.rowCount === 0) {
      throw new Error(`No se pudo actualizar la asistencia para la cita ${id}.`);
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