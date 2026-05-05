const medicoService = require("../services/medico.service");

// INFORMACIÓN DE PERFIL DE MÉDICO LOGEADO
exports.findMedicoLogged = async (req, res) => {
  try {
    //Extraemos id  desde token
    const userId = req.user.id;

    //Consulta al servicio para obtener datos de perfil
    const perfilMedico = await medicoService.findMedicoLogged(userId);

    //Si todo sale bien, respondemos con información solicitada
    return res.status(200).json({
      data: perfilMedico,
      message: "Información de médico.",
      success: true,
    });
  } catch (error) {
    console.error("Error en al obtener información de médico:", error.message);

    //Gestión dinámica del error
    const statusCode = error.message.includes("No se encontró") ? 404 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
};

// Create medico
exports.registerMedico = async (req, res) => {
  try {
    // Obtenemos la data que nos envia el front-end
    const data = await medicoService.registerMedico(req.body);

    // Enviamos la data al front-end
    res.status(201).json({
      success: true,
      data: data,
      message: "Medico registrado correctamente.",
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

// Read de todos los medicos
exports.getMedicos = async (req, res) => {
  try {
    const data = await medicoService.readMedicos();

    return res.status(200).json({
      success: true,
      data: data,
      message: "Medicos obtenidos correctamente.",
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

// Update medico by Id
exports.updateMedico = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtenemos la data que nos envia el front-end
    const data = await medicoService.updateMedico(id, req.body);

    // Enviamos la data al front-end
    res.status(201).json({
      success: true,
      data: data,
      message: "Medico actualizado correctamente.",
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

// Delete medico (pasa a inactivo)
exports.deleteMedico = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await medicoService.deleteMedico(id);

    res.status(200).json({
      success: true,
      data: result,
      message: "Medico eliminado correctamente.",
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};
