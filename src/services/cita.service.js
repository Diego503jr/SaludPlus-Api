const citaModel = require("../models/cita.model");

//TODAS LAS CITAS DE MÉDICO
exports.GetAppointments = async (userId) => {
   
    const agenda = await citaModel.GetAppointments(userId);

    if (!agenda || agenda.length === 0) {
        throw new Error("No se encontraron citas para este médico.");
    }

    return {
        citas: agenda
    };
};