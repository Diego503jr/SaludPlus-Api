const asistenciaModel = require("../models/asistenciaCita.model");

exports.UpdateAsistencia = async (id, asistidoCita) => {

    if (!id) {
        throw new Error("El ID de la cita es obligatorio.");
    }

    if (typeof asistidoCita.asistio !== 'boolean') {
        throw new Error("El campo 'asistio' debe ser verdadero o falso.");
    }

    const asistenciaActualizada = await asistenciaModel.updateAsistido(id, asistidoCita);

    if (!asistenciaActualizada) {
        throw new Error("No se pudo obtener el registro actualizado.");
    }
    
    return asistenciaActualizada;
};