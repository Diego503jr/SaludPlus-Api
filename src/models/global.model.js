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
  let result = await pool.query("SELECT * FROM especialidades");

  // Verificamos si el usuario tiene asignado un (Paciente/Medico)
  if (!result.rows[0]) {
    throw new Error(`No se encontro el paciente.`);
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
