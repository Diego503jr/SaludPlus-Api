const unidadesMedicas = require("../models/unidadesMedicas");

// Create Unidades Medicas
exports.registerUnidadMedica = async (data) => {
  // Hacemos una llamada al model
  const result = await unidadesMedicas.create(data);

  return result;
};

// Read Unidades Medicas
exports.readUnidadesMedicas = async () => {
  let result = await unidadesMedicas.read();

  if (!result) {
    const error = Error("Unidades Medicas no encontradas.");
    error.status = 404;
    throw error;
  }

  return result;
};

// Update Unidades Medicas
exports.updateUnidadMedica = async (id, data) => {
  // Metemos el id dentro de la data para pasarla completa al model
  const finData = { ...data, id };

  // Hacemos una llamada al model
  const result = await unidadesMedicas.update(finData);

  if (!result) {
    const error = Error("Unidad Medica no encontrada.");
    error.status = 404;
    throw error;
  }

  return result;
};

// Delete Unidades Medicas (pasa a inactivo)
exports.deleteUnidadMedica = async (id) => {
  const result = await unidadesMedicas.delete(id);

  if (!result) {
    const error = Error("Unidad Medica no encontrada.");
    error.status = 404;
    throw error;
  }

  return result;
};
