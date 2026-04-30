const recetaModel = require("../models/receta.model");

exports.createReceta = async (pacienteId, medicoId, observaciones) => {
    
    if (!pacienteId) throw new Error("El ID del paciente es requerido.");
    if (!medicoId) throw new Error("El ID del médico es requerido.");

    const nuevaReceta = await recetaModel.createReceta(pacienteId, medicoId, observaciones);

    if (!nuevaReceta) {
        throw new Error("No se encontró una cita válida/activa para generar la receta.");
    }

    return nuevaReceta;
};