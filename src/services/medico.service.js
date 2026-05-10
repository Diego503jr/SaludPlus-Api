const medicoModel = require("../models/medico.model");
const securityLib = require("../utils/security.lib");

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
    M: "Masculino",
    F: "Femenino",
    O: "Otro",
  };

  // Si el género no coincide con las llaves, devolvemos 'No especificado'
  const genero = mapeoGeneros[medico.generoId] || "No especificado";

  //Retornamos el objeto procesado
  return {
    ...medico,
    edad: edad,
    genero: genero,
  };
};

// Create medicos
exports.registerMedico = async (data) => {
  // Hasheamos la pwd con la lib bcrypt
  const hashedPassword = await securityLib.hash(data.password);

  // Hacemos una copia de las propiedades del obj "data" y sobreescribimos la key pwd (Spread Operator)
  const finData = {
    ...data,
    password: hashedPassword,
  };

  // Hacemos una llamada al model
  const result = await medicoModel.create(finData);

  return result;
};

// Read medicos
exports.readMedicos = async () => {
  let result = await medicoModel.read();

  if (!result) {
    const error = Error("Medicos no encontrados.");
    error.status = 404;
    throw error;
  }

  return result;
};

// Update medico
exports.updateMedico = async (id, data) => {
  // Metemos el id dentro de la data para pasarla completa al model
  const finData = { ...data, id };

  // Solo hasheamos si mandan password nuevo
  if (data.password) {
    finData.password = await securityLib.hash(data.password);
  }

  // Hacemos una llamada al model
  const result = await medicoModel.update(finData);

  if (!result) {
    const error = Error("Medico no encontrado.");
    error.status = 404;
    throw error;
  }

  return result;
};

// Delete medico (pasa a inactivo)
exports.deleteMedico = async (id) => {
  const result = await medicoModel.delete(id);

  if (!result) {
    const error = Error("Medico no encontrado.");
    error.status = 404;
    throw error;
  }

  return result;
};
