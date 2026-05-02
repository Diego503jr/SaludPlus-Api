const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class SecurityLib {
  constructor() {
    this.saltRounds = 10;
    this.secret = process.env.JWT_SECRET;
  }

  /**
   * Hashea la contraseña (Asíncrono)
   */
  async hash(val) {
    return await bcrypt.hash(val, this.saltRounds);
  }

  /**
   * Compara texto plano con el hash de la DB
   */
  async compare(val, valHash) {
    return await bcrypt.compare(val, valHash);
  }

  /**
   * Crear un JWT firmado
   */
  createToken(payload, expires = "1h") {
    return this.#_createToken(payload, expires);
  }

  #_createToken(payload, expires = "1h") {
    // Validaciones previas
    if (!payload) {
      console.log("Esta vacio el payload.");
      return;
    }

    if (!payload.usuarioid > 0 && !payload.rolid) {
      console.log("No tienes los datos requeridos para crear el token.");
      return;
    }

    // Hasheamos
    return jwt.sign(
      { id: payload.usuarioid, rol: payload.rolid },
      this.secret,
      { expiresIn: expires },
    );
  }

  /**
   * Valida un JWT y devuelve el contenido (payload)
   */
  validateToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      return null; // Token expirado o inválido
    }
  }
}

module.exports = new SecurityLib();
