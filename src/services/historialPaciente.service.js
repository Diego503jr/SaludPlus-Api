const historialPacienteModel = require("../models/historialPaciente.model");

exports.updateHistorialPaciente = async (id, historial) => {

    if (!id) {
        throw new Error("El ID del paciente es obligatorio.");
    }

    const historialActualizado = await historialPacienteModel.updateHistorialPaciente(id, historial);

    if (!historialActualizado) {
        throw new Error("No se pudo obtener el registro actualizado.");
    }
    
    return historialActualizado;
};