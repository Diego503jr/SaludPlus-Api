const usuarioModel = require("../models/usuario.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Funcion de service para registrar de paciente
exports.registerPaciente = async (data) => {
  // Hasheamos la pwd con la lib bcrypt
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Hacemos una copia de las propiedades del obj "data" y sobreescribimos la key pwd (Spread Operator)
  const finData = {
    ...data,
    password: hashedPassword,
  };

  // Hacemos una llamada al model
  const result = await usuarioModel.createPaciente(finData);

  const { id, ...cleanUser } = result;

  return cleanUser;
};

// Funcion de service para registrar de medico
exports.registerMedico = async (data) => {
  // Hasheamos la pwd con la lib bcrypt
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Hacemos una copia de las propiedades del obj "data" y sobreescribimos la key pwd (Spread Operator)
  const finData = {
    ...data,
    password: hashedPassword,
  };

  // Hacemos una llamada al model
  const result = await usuarioModel.createMedico(finData);

  const { id, ...cleanUser } = result;

  return cleanUser;
};

// Funcion de service para realizar el login
exports.login = async (data) => {
  // Hacemos una llamada al model
  const result = await usuarioModel.findByEmail(data);

  // Verificamos si no hay usuario
  if (!result) throw new Error("Usuario no encontrado");

  // Comparamos las pwd de la db y con la que le pasamos en data
  const valid = await bcrypt.compare(data.password, result.password);
  if (!valid) throw new Error("Contraseña incorrecta");

  // Creamos el token de autenticacion
  const token_jwt = jwt.sign(
    { id: result.id, rol: result.rol_id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  // hacemos un destructuring para quitar el id y la pwd
  const { id, password, ...cleanUser } = result;

  // Creamos un solo objeto haciendo spread operator
  const user = {
    ...cleanUser,
    token: token_jwt,
  };

  return user;
};
