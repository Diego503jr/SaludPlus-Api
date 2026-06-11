const authService = require("../services/auth.service");
const securityLib = require("../utils/security.lib");

exports.registerPaciente = async (req, res) => {
  try {
    // Obtenemos la data que nos envia el front-end
    const data = await authService.registerPaciente(req.body);

    // Enviamos la data al front-end
    res.status(201).json({
      success: true,
      data: data,
      message: "Paciente registrado correctamente.",
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
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
    res.status(200).json({
      success: true,
      data: data,
      message: "Login Corretamente",
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

exports.logout = async (req, res) => {
  try {
    // const data = await
    const data = await authService.logout(req);

    res.status(200).json({
      success: true,
      data: data,
      meesage: "Logout Correctamente",
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};

// usuario.controller.js
exports.refresh = async (req, res) => {
  try {
    const session = await authService.refresh(req.body);

    return res.status(200).json({
      success: true,
      data: session,
      message: "Token renovado.",
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      ...(err.expired && { expired: true }),
      message: err.message,
    });
  }
};
