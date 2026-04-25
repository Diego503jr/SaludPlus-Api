const usuarioModel = require("../models/usuario.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const finData = {
    ...data,
    password: hashedPassword,
  };

  const result = await usuarioModel.create(finData);

  return result.rows[0];
};

exports.login = async (data) => {
  const result = await usuarioModel.findByEmail(data.email);

  const user = result.rows[0];
  if (!user) throw new Error("Usuario no encontrado");

  const valid = await bcrypt.compare(data.password, user.password_hash);
  if (!valid) throw new Error("Contraseña incorrecta");

  const token = jwt.sign(
    { id: user.id, rol: user.rol_id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return { user, token };
};
