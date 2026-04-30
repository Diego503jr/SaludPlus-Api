const pool = require("../config/db");

//GET INFORMACIÓN DEL MÉDICO LOGEADO
exports.findMedicoLogged = async (id) => {
  const client = await pool.connect();

  try {
    const query = `
        SELECT 
            U.id, U.nombre, U.apellido, U.dui, U.email, U.telefono,
            U.fecha_nacimiento AS "fechaNacimiento",
            U.genero AS "generoId", U.rol_id AS "rolId", U.activo,
            M.num_jvpm AS "numJvmp",
            M.especialidad_id AS especialidad,
            M.unidad_medica_id AS "unidadMedica"
        FROM usuarios U
        INNER JOIN medicos M ON U.id = M.usuario_id
        WHERE U.id = $1`;

    const response = await client.query(query, [id]);

    // Si no hay filas, el médico no existe
    if (response.rows.length === 0) {
        throw new Error(`No existe el médico con el ID: ${id}`);
    }

    return response.rows[0];

  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};