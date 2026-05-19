const unidadMedicaService = require("../services/unidadesMedicas.service");

// Crear Unidad Médica
exports.registerUnidadMedica = async (req, res) => {
  try {
    // Obtenemos la data que nos envía el front-end desde el body
    const data = await unidadMedicaService.registerUnidadMedica(req.body);

    // Enviamos la respuesta de éxito
    return res.status(201).json({
      success: true,
      data: data,
      message: "Unidad Médica registrada correctamente.",
    });
  } catch (err) {
    // Gestión del error
    return res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};

// Obtener todas las Unidades Médicas
exports.getUnidadesMedicas = async (req, res) => {
  try {
    const data = await unidadMedicaService.readUnidadesMedicas();

    return res.status(200).json({
      success: true,
      data: data,
      message: "Unidades Médicas obtenidas correctamente.",
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};

// Actualizar Unidad Médica por ID
exports.updateUnidadMedica = async (req, res) => {
  try {
    // Extraemos el id de los parámetros de la URL
    const { id } = req.params;

    // Llamamos al servicio pasando id y el cuerpo de la petición
    const data = await unidadMedicaService.updateUnidadMedica(id, req.body);

    return res.status(200).json({
      success: true,
      data: data,
      message: "Unidad Médica actualizada correctamente.",
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};

// Eliminar Unidad Médica (Borrado lógico / Desactivar)
exports.deleteUnidadMedica = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await unidadMedicaService.deleteUnidadMedica(id);

    return res.status(200).json({
      success: true,
      data: result,
      message: "Unidad Médica eliminada correctamente.",
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};
