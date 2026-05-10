const globalModel = require("../models/global.model");

// Funcion para obtener todos los roles
exports.readAllRoles = async () => {
  return await globalModel.readRoles();
};

// Funcion para obtener todas las especialidades
exports.readAllEspecialidades = async () => {
  return await globalModel.readEspecialidades();
};

// Funcion para obtener todas las unidades medicas
exports.readAllUnidadesMedicas = async () => {
  return await globalModel.readUnidadesMedicas();
};

//Funcion para obtener las Unidades Medicas
exports.obtenerUnidades = async (idEspecialidad) => {
    try {
        const unidades = await globalModel.obtenerUnidadesPorEspecialidad(idEspecialidad);
        return unidades;
    } catch (error) {
        throw error;
    }
};
