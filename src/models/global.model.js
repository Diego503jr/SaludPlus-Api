const pool = require("../config/db");

// Funcion para obtener los roles
exports.readRoles = async () => {
  let result = await pool.query("SELECT * FROM roles");

  // Verificamos si el usuario tiene asignado un (Paciente/Medico)
  if (!result.rows[0]) {
    throw new Error(`No se encontro el paciente.`);
  }

  // Retornamos el result por default de la db
  return result.rows;
};

// Funcion para obtener las especialidades
exports.readEspecialidades = async () => {
  let result = await pool.query("SELECT * FROM especialidades WHERE activo = true");

  if (!result.rows[0]) {
    throw new Error(`No se encontraron especialidades activas.`);
  }

  // Retornamos el result por default de la db
  return result.rows;
};

// Funcion para obtener las unidades medicas
exports.readUnidadesMedicas = async () => {
  let result = await pool.query(
    "SELECT id AS unidadMedicaId, nombre || ' - ' || codigo AS unidadMedica FROM unidades_medicas",
  );

  // Verificamos si el usuario tiene asignado un (Paciente/Medico)
  if (!result.rows[0]) {
    throw new Error(`No se encontro el paciente.`);
  }

  // Retornamos el result por default de la db
  return result.rows;
};



// PASO 2: OBTENER UNIDADES MÉDICAS POR ESPECIALIDAD
exports.obtenerUnidadesPorEspecialidad = async (idEspecialidad) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
          um.id, 
          um.nombre, 
          um.direccion 
      FROM unidades_medicas um
      INNER JOIN unidad_especialidad ue ON um.id = ue.unidad_medica_id
      WHERE ue.especialidad_id = $1 
        AND um.activo = true 
        AND ue.activo = true
      ORDER BY um.nombre ASC;
    `;

    const response = await client.query(query, [idEspecialidad]);
    return response.rows;

  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};
