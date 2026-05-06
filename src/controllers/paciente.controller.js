const pacienteService = require("../services/paciente.service");

// INFORMACIÓN DE PERFIL DE PACIENTE
exports.GetPatientInfo = async (req, res) => {
  try {
    //Id enviado desde frontend
    const { patientId } = req.params;

    //Si no se recibe el id de paciente
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "El ID del usuario es requerido.",
      });
    }

    //Consulta al servicio
    const patientProfile = await pacienteService.GetPatientInfo(patientId);

    //Respuesta exitosa
    return res.status(200).json({
      data: patientProfile,
      message: "Información de paciente.",
      success: true,
    });
  } catch (error) {
    //Error
    console.error(
      "Error en al obtener información de paciente:",
      error.message,
    );

    const statusCode = error.message.includes("No se encontró") ? 404 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
};

// Funcion para acceder a todos los pacientes
exports.getPacientes = async (req, res) => {
  try {
    const data = await pacienteService.readPacientes();

    return res.status(200).json({
      success: true,
      data: data,
      message: "Pacientes obtenidos correctamente.",
    });
  } catch (err) {
    // Enviamos la data de error al front-end
    res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};
