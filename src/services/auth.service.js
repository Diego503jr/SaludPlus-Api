const usuarioModel = require("../models/usuario.model");
const securityLib = require("../utils/security.lib");

// Funcion de service para registrar de paciente
exports.registerPaciente = async (data) => {
  // Hasheamos la pwd con la lib bcrypt
  const hashedPassword = await securityLib.hash(data.password);

  // Hacemos una copia de las propiedades del obj "data" y sobreescribimos la key pwd (Spread Operator)
  const finData = {
    ...data,
    password: hashedPassword,
  };

  // Hacemos una llamada al model
  const result = await usuarioModel.createPaciente(finData);

  return result;
};

// Funcion de service para realizar el login
exports.login = async (data) => {
  let result = null;

  // Hacemos una llamada al model con base al rol
  if (data.rol === 1) {
    result = await usuarioModel.findByPacient(data);
  } else if (data.rol === 2) {
    result = await usuarioModel.findByMedic(data);
  } else if (data.rol === 3) {
    result = await usuarioModel.findByAdmin(data);
  }

  // Verificamos si no hay usuario
  if (!result) {
    const error = Error("Usuario no encontrado");
    error.status = 400;
    throw error;
  }

  // Comparamos las pwd de la db y con la que le pasamos en data
  const valid = await securityLib.compare(data.password, result.password);
  if (!valid) {
    const error = Error("Contraseña incorrecta");
    error.status = 400;
    throw error;
  }

  // Creamos el token de autenticacion
  const token_jwt = securityLib.createToken(result);

  if (!token_jwt) throw new Error("No se logro generar el token de inicio.");

  // Hacemos un destructuring para quitar el id y la pwd
  const { password, ...cleanUser } = result;

  // Creamos un solo objeto haciendo spread operator
  const user = {
    ...cleanUser,
    token: token_jwt,
  };

  const loginRegistered = await usuarioModel.registerLogIn(user);

  // Registramos el token para usarlo por autenticacion en la app en funcionalidades a usar
  if (!loginRegistered) {
    throw new Error("No se logro iniciar sesion por el token.");
  }

  return user;
};

// Funcion de service para realizar el logout
exports.logout = async (data) => {
  const result = await usuarioModel.deleteLogIn(data.body);

  return result;
};

// Funcion de service para renovar el access token
exports.refresh = async (data) => {
  const refreshToken = data.refreshToken; // o desde header

  if (!refreshToken) {
    const error = Error("No hay token para realizar el refresh.");
    error.status = 401;
    throw error;
  }

  // 1. Validar el refresh token (firma + expiración)
  const result = securityLib.validateToken(refreshToken);

  if (!result.valid) {
    // Refresh expirado o inválido → logout real
    try {
      await usuarioModel.deleteLogIn({ token: refreshToken });
    } catch (err) {}

    const error = Error("Sesión expirada. Inicia sesión nuevamente.");
    error.status = 401;
    error.expired = true;
    throw error;
  }

  // 2. Verificar que el refresh exista en la DB (no haya sido revocado)
  const existe = await usuarioModel.buscarRefreshToken({
    token: refreshToken,
  });

  if (!existe) {
    const error = Error("Sesión no válida.");
    error.status = 401;
    error.expired = true;
    throw error;
  }

  // 3. Generar un NUEVO access token
  const new_jwt = securityLib.createToken({
    usuarioid: result.decoded.id,
    rolid: result.decoded.rol,
  });

  const response = usuarioModel.refreshToken({
    newToken: new_jwt,
    oldToken: refreshToken,
  });

  return response;
};
