const securityLib = require("../utils/security.lib");
const usuarioModel = require("../models/usuario.model");

module.exports = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, data: {}, message: "No hay token" });
  }

  // Quitamos el prefijo "Bearer " si viene incluido
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const result = securityLib.validateToken(token);

    // Token válido
    if (result.valid) {
      req.user = result.decoded;
      return next();
    }

    // Token EXPIRADO
    if (result.expired) {
      try {
        await usuarioModel.deleteLogIn({ token });
      } catch (err) {
        // Si ya estaba borrado o falló el delete, no rompemos la respuesta:
        // el resultado para el cliente es el mismo (debe hacer logout)
        console.error("No se pudo eliminar el token expirado:", err.message);
      }

      return res.status(401).json({
        success: false,
        data: {},
        expired: true, // hacer logout
        message: "La sesión ha expirado. Inicia sesión nuevamente.",
      });
    }

    return res.status(401).json({
      success: false,
      data: {},
      message: "Token inválido.",
    });
  } catch (err) {
    res.status(401).json({ success: false, data: {}, message: err.message });
  }
};
