const authService = require("../services/auth.service");

exports.registerPaciente = async (req, res) => {
  try {
    // Obtenemos la data que nos envia el front-end
    const data = await authService.registerPaciente(req.body);

    // Enviamos la data al front-end
    res.json({
      succes: true,
      data: data,
      message: "Paciente registrado correctamente.",
    });
  } catch (err) {
    res.status(500).json({
      succes: false,
      data: {},
      message: err.message,
    });
  }
};

exports.registerMedico = async (req, res) => {
  try {
    // Obtenemos la data que nos envia el front-end
    const data = await authService.registerMedico(req.body);

    // Enviamos la data al front-end
    res.json({
      succes: true,
      data: data,
      message: "Medico registrado correctamente.",
    });
  } catch (err) {
    // Enviamos la data de error al front-end
    res.status(500).json({
      succes: false,
      data: {},
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    // Obtenemos la data que nos envia el front-end
    const data = await authService.login(req.body);

    // Enviamos la data al front-end
    res.json({
      succes: true,
      data: data,
      message: "Login Corretamente",
    });
  } catch (err) {
    // Enviamos la data de error al front-end
    res.status(401).json({
      succes: false,
      data: {},
      message: err.message,
    });
  }
};
