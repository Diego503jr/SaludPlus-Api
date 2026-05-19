const medicamentoModel = require("../models/medicamento.model");

//TODOS LOS MEDICAMENTOS / MEDICAMENTOS POR ID
exports.getMedicine = async (id = null) => {
  //Consulta al modelo para obtener un medicamento por id o todos los medicamentos
  const medicine = await medicamentoModel.getMedicine(id);

  //No se encuentran medicamentos
  if (!medicine || medicine.length === 0) {
    throw new Error("No se encontraron medicamentos.");
  }

  //Devolvemos información
  return {
    medicamentos: medicine,
  };
};

// Read medicamentos
exports.readMedicamentos = async () => {
  let result = await medicamentoModel.read();

  if (!result) {
    const error = Error("Medicamentos no encontrados.");
    error.status = 404;
    throw error;
  }

  return result;
};

// Update medicamento
exports.updateMedicamento = async (id, data) => {
  // Metemos el id dentro de la data para pasarla completa al model
  const finData = { ...data, id };

  // Hacemos una llamada al model
  const result = await medicamentoModel.update(finData);

  if (!result) {
    const error = Error("Medicamento no encontrado.");
    error.status = 404;
    throw error;
  }

  return result;
};

// Delete medicamento (pasa a inactivo)
exports.deleteMedicamento = async (id) => {
  const result = await medicamentoModel.delete(id);

  if (!result) {
    const error = Error("Medicamento no encontrado.");
    error.status = 404;
    throw error;
  }

  return result;
};
