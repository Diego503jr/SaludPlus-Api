const securityLib = require("../utils/security.lib");

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

    // Token Expirado. Solo avisar que se debe refrescar.
    if (result.expired) {
      return res.status(401).json({
        success: false,
        data: {},
        expired: true, // Hacer refresh
        message: "Token expirado.",
      });
    }

    // Firma inválida / token manipulado → acá sí, logout directo
    return res.status(401).json({
      success: false,
      data: {},
      expired: false, // Hacer logout
      message: "Token inválido.",
    });
  } catch (err) {
    res.status(401).json({ success: false, data: {}, message: err.message });
  }
};
