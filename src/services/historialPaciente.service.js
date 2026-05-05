const historialPacienteModel = require("../models/historialPaciente.model");

//FUNCIÓN PARA ACTUALIZAR HISTORIAL DE PACIENTE
exports.updateHistorialPaciente = async (id, historial) => {

    //Validamos si se recibe id de paciente
    if (!id) {
        throw new Error("El ID del paciente es obligatorio.");
    }

    //Consulta al modelo enviando id e información de historial
    const historialActualizado = await historialPacienteModel.updateHistorialPaciente(id, historial);

    //Si no se actualiza el historial
    if (!historialActualizado) {
        throw new Error("No se pudo obtener el registro actualizado.");
    }
    
    //Devolvemos información (Actualización exitosa)
    return historialActualizado;
};