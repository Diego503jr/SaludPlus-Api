const unidadEspecialidadService = require("../services/unidadEspecialidad.service");

// Create unidad_especialidad
exports.registerUnidadEspecialidad = async (req, res) => {
  try {
    // Obtenemos la data que nos envia el front-end
    const data = await unidadEspecialidadService.registerUnidadEspecialidad(
      req.body,
    );

    // Enviamos la data al front-end
    res.status(201).json({
      success: true,
      data: data,
      message: "Unidad especialidad registrada correctamente.",
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

// Read de todas las unidades_especialidad
exports.getUnidadesEspecialidad = async (req, res) => {
  try {
    const data = await unidadEspecialidadService.readUnidadesEspecialidad();

    return res.status(200).json({
      success: true,
      data: data,
      message: "Unidades especialidad obtenidas correctamente.",
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

// Update unidad_especialidad by Id
exports.updateUnidadEspecialidad = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtenemos la data que nos envia el front-end
    const data = await unidadEspecialidadService.updateUnidadEspecialidad(
      id,
      req.body,
    );

    // Enviamos la data al front-end
    res.status(201).json({
      success: true,
      data: data,
      message: "Unidad especialidad actualizada correctamente.",
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

// Delete unidad_especialidad (pasa a inactivo)
exports.deleteUnidadEspecialidad = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await unidadEspecialidadService.deleteUnidadEspecialidad(id);

    res.status(200).json({
      success: true,
      data: result,
      message: "Unidad especialidad eliminada correctamente.",
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};
