const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  try {
    const data = await authService.register(req.body);
    res.json({
      succes: true,
      data: data,
      message: "Registro correctamente",
    });
  } catch (err) {
    res.status(500).json({
      succes: false,
      data: {},
      error: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const data = await authService.login(req.body);

    res.json({
      succes: true,
      data: data,
      message: "Login Corretamente",
    });
  } catch (err) {
    res.status(401).json({
      succes: false,
      data: {},
      error: err.message,
    });
  }
};
