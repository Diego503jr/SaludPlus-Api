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
    const refreshToken = req.body.refreshToken; // o desde header

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No hay refresh token",
      });
    }
    // 1. Validar el refresh token (firma + expiración)
    const result = securityLib.validateToken(refreshToken);

    if (!result.valid) {
      try {
        // Refresh expirado o inválido → logout real
        await usuarioModel.deleteLogIn({ token: refreshToken });
      } catch (err) {}

      return res.status(401).json({
        success: false,
        expired: true,
        message: "Sesión expirada. Inicia sesión nuevamente.",
      });
    }

    // 2. Verificar que el refresh exista en la DB (no haya sido revocado)
    const existe = await usuarioModel.buscarRefreshToken({
      token: refreshToken,
    });

    if (!existe) {
      return res.status(401).json({
        success: false,
        expired: true,
        message: "Sesión no válida.",
      });
    }
    // 3. Generar un NUEVO access token
    const nuevoAccessToken = securityLib.createToken({
      usuarioid: result.decoded.id,
      rolid: result.decoded.rol,
    });

    return res.status(200).json({
      success: true,
      data: { accessToken: nuevoAccessToken },
      message: "Token renovado.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
