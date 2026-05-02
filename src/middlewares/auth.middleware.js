// const jwt = require("jsonwebtoken");
const securityLib = require("../utils/security.lib");

module.exports = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token)
    return res
      .status(401)
      .json({ success: false, data: {}, message: "No hay token" });

  try {
    const decoded = securityLib.validateToken(token);

    if (!decoded) {
      throw new Error("Token inválido");
    } else {
      req.user = decoded;
      next();
    }
  } catch (err) {
    res.status(401).json({ success: false, data: {}, message: err.message });
  }
};
