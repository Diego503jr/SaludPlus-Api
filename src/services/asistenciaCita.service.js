const asistenciaModel = require("../models/asistenciaCita.model");

//FUNCIÓN PARA ACTUALIZAR ESTADO DE CITA
exports.UpdateAsistencia = async (id, asistidoCita) => {

    //Validamos que se reciba el id de cita
    if (!id) {
        throw new Error("El ID de la cita es obligatorio.");
    }

    //Validamos tipo de dato
    if (typeof asistidoCita.asistio !== 'boolean') {
        throw new Error("El campo 'asistio' debe ser verdadero o falso.");
    }

    //Consulta al modelo, enviando id y estado
    const asistenciaActualizada = await asistenciaModel.updateAsistido(id, asistidoCita);

    //Error
    if (!asistenciaActualizada) {
        throw new Error("No se pudo obtener el registro actualizado.");
    }
    
    //Devolvemos información (asistencia exitosa)
    return asistenciaActualizada;
};