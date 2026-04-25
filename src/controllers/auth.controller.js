const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  try {
    const data = await authService.register(req.body);
    res.json({
      succes: true,
      data: {
        id: data.id,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        rol_id: data.rol_id,
      },
      message: "Registro correctamente",
    });
  } catch (err) {
    res.status(500).json({
      succes: false,
      error: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.json({
      succes: true,
      data: {
        id: data.id,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        rol_id: data.rol_id,
      },
      message: "Login correctamente",
    });
  } catch (err) {
    res.status(401).json({
      succes: false,
      error: err.message,
    });
  }
};
