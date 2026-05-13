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
    // Verificamos si existe la llave superAdmin
    if (!data?.superAdmin) {
      const error = new Error("Recurso no encontrado.");
      error.status = 404;
      throw error;
    }

    // Verificamos datos requeridos
    if (!data.email || !data.password) {
      const error = new Error("No hay datos requeridos");
      error.status = 400;
      throw error;
    }

    switch (data.superAdmin) {
      case "saludplusnewadmin":
        // Hasheamos la pwd con la lib bcrypt
        const hashedPassword = await securityLib.hash(data.password);

        const finData = {
          ...data,
          password: hashedPassword,
        };

        // Creamos al admin por default
        result = await usuarioModel.createAnAdmin(finData);
        break;
      case "saludplusadminisss":
        // Seguimos con logica de inicio de sesion
        result = await usuarioModel.findByAdmin(data);
        break;
      default:
        const error = new Error("No tiene permisos para acceder");
        error.status = 403;
        throw error;
    }
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
