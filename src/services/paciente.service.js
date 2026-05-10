const pacienteModel = require("../models/paciente.model");

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

// Funcion para obtener todos los clientes
exports.readPacientes = async () => {
  let result = await pacienteModel.read();

  if (!result) {
    const error = Error("Medicos no encontrados.");
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
        if (error.message === 'Paciente no encontrado') {
            throw error;
        }
        throw new Error('Error al actualizar en la base de datos');
    }
};
