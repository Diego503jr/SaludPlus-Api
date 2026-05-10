const pacienteModel = require("../models/paciente.model");
const securityLib = require("../utils/security.lib");

//INFORMACIÓN PACIENTE ID
exports.GetPatientInfo = async (patientId) => {
  const patient = await pacienteModel.GetPatientInfo(patientId);

  if (!patient) {
    throw new Error("No se encontró el perfil del paciente.");
  }

  // Calcular edad
  const hoy = new Date();
  const fechaNac = new Date(patient.fechaNacimiento);
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
  const genero = mapeoGeneros[patient.generoId] || "No especificado";

  //Retornamos el objeto procesado
  return {
    ...patient,
    edad: edad,
    genero: genero,
  };
};

// Read Pacientes
exports.readPacientes = async () => {
  let result = await pacienteModel.read();

  if (!result) {
    const error = Error("Medicos no encontrados.");
    error.status = 404;
    throw error;
  }

  return result;
};

// Update Paciente
exports.updatePaciente = async (id, data) => {
  // Metemos el id dentro de la data para pasarla completa al model
  const finData = { ...data, id };

  // Solo hasheamos si mandan password nuevo
  if (data.password) {
    finData.password = await securityLib.hash(data.password);
  }

  // Hacemos una llamada al model
  const result = await pacienteModel.update(finData);

  if (!result) {
    const error = Error("Paciente no encontrado.");
    error.status = 404;
    throw error;
  }

  return result;
};

// Delete Paciente (pasa a inactivo)
exports.deletePaciente = async (id) => {
  const result = await pacienteModel.delete(id);

  if (!result) {
    const error = Error("Paciente no encontrado.");
    error.status = 404;
    throw error;
  }

  return result;
};

// ==========================================
// EDITAR PERFIL (PUT): SERVICIO
// ==========================================
exports.editarPerfil = async (idPaciente, datos) => {
  try {
    await pacienteModel.actualizarPerfil(idPaciente, datos);

    return { mensaje: "Perfil actualizado correctamente" };
  } catch (error) {
    if (error.message === "Paciente no encontrado") {
      throw error;
    }
    throw new Error("Error al actualizar en la base de datos");
  }
};
