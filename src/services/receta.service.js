const recetaModel = require("../models/receta.model");

//FUNCIÓN PARA CREAR RECETA
exports.createReceta = async (pacienteId, medicoId, observaciones) => {
  //Validamos si recibimos id
  if (!pacienteId) throw new Error("El ID del paciente es requerido.");
  if (!medicoId) throw new Error("El ID del médico es requerido.");

  //Consulta al modelo enviando información
  const nuevaReceta = await recetaModel.createReceta(
    pacienteId,
    medicoId,
    observaciones,
  );

  //Si no se puede asociar la receta a la cita
  if (!nuevaReceta) {
    throw new Error(
      "No se encontró una cita válida/activa para generar la receta.",
    );
  }

  //Devolvemos información (Si es exitoso)
  return nuevaReceta;
};

// FUNCION PARA OBTENER CITA PACIENTE
exports.getCitaByPaciente = async (citaId) => {
  //Consulta al modelo enviando información
  const receta = await recetaModel.getCitaById(citaId);

  //Si no se puede asociar la receta a la cita
  if (!receta) {
    throw new Error("No se encontró una cita válida.");
  }

  //Devolvemos información (Si es exitoso)
  return receta;
};
