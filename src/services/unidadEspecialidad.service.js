const unidadEspecialidadModel = require("../models/unidadEspecialidad.model");

// Create unidad_especialidad
exports.registerUnidadEspecialidad = async (data) => {
  // Hacemos una llamada al model
  const result = await unidadEspecialidadModel.create(data);

  return result;
};

// Read unidad_especialidad
exports.readUnidadesEspecialidad = async () => {
  let result = await unidadEspecialidadModel.read();

  if (!result) {
    const error = Error("Unidades especialidad no encontradas.");
    error.status = 404;
    throw error;
  }

  return result;
};

// Update unidad_especialidad
exports.updateUnidadEspecialidad = async (id, data) => {
  // Metemos el id dentro de la data para pasarla completa al model
  const finData = { ...data, id };

  // Hacemos una llamada al model
  const result = await unidadEspecialidadModel.update(finData);

  if (!result) {
    const error = Error("Unidad especialidad no encontrada.");
    error.status = 404;
    throw error;
  }

  return result;
};

// Delete unidad_especialidad (pasa a inactivo)
exports.deleteUnidadEspecialidad = async (id) => {
  const result = await unidadEspecialidadModel.delete(id);

  if (!result) {
    const error = Error("Unidad especialidad no encontrada.");
    error.status = 404;
    throw error;
  }

  return result;
};
