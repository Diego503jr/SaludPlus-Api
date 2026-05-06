const globalService = require("../services/global.service");

// Funcion para obtener todos los roles
exports.getRoles = async (req, res) => {
  try {
    const data = await globalService.readAllRoles();

    res.status(200).json({
      success: true,
      data: data,
      message: "Roles obtenidos.",
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};

// Funcion para obtener todas las especialidades
exports.getEspecialidades = async (req, res) => {
  try {
    const data = await globalService.readAllEspecialidades();

    res.status(200).json({
      success: true,
      data: data,
      message: "Especialidades obtenidas.",
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};

// Funcion para obtener todas las unidades medicos
exports.getUnidadesMedicas = async (req, res) => {
  try {
    const data = await globalService.readAllUnidadesMedicas();

    res.status(200).json({
      success: true,
      data: data,
      message: "Unidades Medicas obtenidas.",
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};
