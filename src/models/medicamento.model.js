const pool = require("../config/db");

//GET TODOS LOS MEDICAMENTOS ACTIVOS O UN MEDICAMENTO POR ID
exports.getMedicine = async (id = null) => {
  const client = await pool.connect();

  try {
    //Consulta para obtener todos los medicamentos disponibles o un medicamento por id
    const query = `
      SELECT id, nombre_generico AS "nombreGenerico",
      nombre_comercial AS "nombreComercial",
      forma_farmaceutica AS "formaFarmaceutica",
      concentracion, activo
      FROM medicamentos 
      WHERE activo = True 
        AND ($1::INT IS NULL OR id = $1::INT)
      ORDER BY id ASC`;
    const response = await client.query(query, [id]);

    // Si no hay filas
    if (response.rows.length === 0) {
        throw new Error(`No hay medicamentos disponibles`);
    }

    return response.rows;

  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};