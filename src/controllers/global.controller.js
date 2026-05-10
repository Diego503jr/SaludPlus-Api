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


// CONTROLADOR: OBTENER UNIDADES MÉDICAS POR ESPECIALIDAD
exports.getUnidadesPorEspecialidad = async (req, res) => {
    try {
        const idEspecialidad = req.params.idEspecialidad;

        if (!idEspecialidad) {
            return res.status(400).json({
                exito: false,
                mensaje: "El ID de la especialidad es requerido"
            });
        }

        const unidades = await globalService.obtenerUnidades(idEspecialidad);

        res.status(200).json({
            exito: true,
            datos: unidades
        });

    } catch (error) {
        console.error("Error en getUnidadesMedicas:", error);
        res.status(500).json({
            exito: false,
            mensaje: "Error interno del servidor"
        });
    }
};
