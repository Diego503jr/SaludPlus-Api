const recetaService = require("../services/receta.service");

//FUNCIÓN PARA CREAR RECETA
exports.createReceta = async (req, res) => {
  try {
    // ID del paciente viene de la URL (:id)
    const { id: pacienteId } = req.params;

    // ID del médico viene de la sesión/token (autenticación)
    const medicoId = req.user.id;

    // Otros datos (como observaciones) vienen del body
    const { observaciones } = req.body;

    //Consulta al servicio, enviando parametros
    const result = await recetaService.createReceta(
      pacienteId,
      medicoId,
      observaciones,
    );

    //Respuesta exitosa
    return res.status(201).json({
      data: result,
      success: true,
      message: "Receta creada correctamente.",
    });
  } catch (error) {
    //Error
    console.error("Error al crear receta:", error.message);
    const statusCode = error.message.includes("No se encontró") ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Error al procesar la receta.",
    });
  }
};

// PARA PACIENTE
exports.getCitaById = async (req, res) => {
  try {
    const idCita = req.params.citaId;

    const data = recetaService.getCitaByPaciente(idCita);

    // Enviamos la data al front-end
    res.status(200).json({
      success: true,
      data: data,
      message: "Cita Obtenida correctamente",
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};
