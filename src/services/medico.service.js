const medicoModel = require("../models/medico.model");

// PERFIL DE MÉDICO
exports.findMedicoLogged = async (userId) => {
    const medico = await medicoModel.findMedicoLogged(userId);

    if (!medico) {
        throw new Error("No se encontró el perfil del médico.");
    }

    // Calcular edad
    const hoy = new Date();
    const fechaNac = new Date(medico.fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }

    // Lógica para transformar el GÉNERO
    const mapeoGeneros = {
        'M': 'Masculino',
        'F': 'Femenino',
        'O': 'Otro'
    };
    
    // Si el género no coincide con las llaves, devolvemos 'No especificado'
    const genero = mapeoGeneros[medico.generoId] || "No especificado";

    //Retornamos el objeto procesado
    return {
        ...medico,
        edad: edad,
        genero: genero
    };
};