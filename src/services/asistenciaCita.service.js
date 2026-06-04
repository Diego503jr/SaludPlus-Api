const asistenciaModel = require("../models/asistenciaCita.model");

// FUNCIÓN PARA REGISTRAR LA ASISTENCIA A UNA CITA
exports.updateAsistido = async (id, asistidoCita, medicoId) => {

    // Validamos que se reciba el id de cita
    if (!id) {
        throw new Error("El ID de la cita es obligatorio.");
    }

    // Validamos que se reciba el id del médico logueado
    if (!medicoId) {
        throw new Error("El ID del médico es obligatorio para registrar la asistencia.");
    }

    //Si no se envian los campos, colocamos en True por defecto3
    if(asistidoCita.asistio === undefined) {
        asistidoCita.asistio = true;
    }

    // Validamos tipo de dato del cuerpo
    if (typeof asistidoCita.asistio !== 'boolean') {
        throw new Error("El campo 'asistio' debe ser un valor booleano (true o false).");
    }

    // Consulta al modelo, enviando id de cita, la data y el id del médico
    const nuevaAsistencia = await asistenciaModel.updateAsistido(id, asistidoCita, medicoId);

    // Error en caso de que el modelo no devuelva la fila insertada
    if (!nuevaAsistencia) {
        throw new Error(`No se pudo registrar la asistencia para la cita ${id}.`);
    }
    
    // Devolvemos la información del nuevo registro insertado
    return nuevaAsistencia;
};