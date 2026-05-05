const pool = require("../config/db");
const recetaMedicamentoModel = require("../models/recetaMedicamento.model");

//CREAR DETALLE RECETA
exports.createReceta = async (data) => {
  
  //Si se envia un solo objeto lo convertimos en array
  const listaDetalles = Array.isArray(data) ? data : [data];

  const client = await pool.connect();

  try {
    //Inicio de transacción
    await client.query("BEGIN");
    const resultados = [];

    //Iteración sobre la lista de medicamentos
    for (const detalle of listaDetalles) {
      // Validaciones
      if (!detalle.recetaId) throw new Error("El ID de la receta es requerido.");
      if (!detalle.medicamentoId) throw new Error("El ID del medicamento es requerido.");
      if (!detalle.dosis) throw new Error("La dosis es requerida.");
      if (!detalle.cantidad) throw new Error("La cantidad es requerida.");

      //Llamado al modelo para insertar cada medicamento
      const nuevoRegistro = await recetaMedicamentoModel.createReceta(detalle, client);
      resultados.push(nuevoRegistro);
    }

    //Si todos los registros fueron exitosos confirmamos transacción
    await client.query("COMMIT");
    return resultados;

  } catch (err) {
    //Si un registro falló, hacemos rollback
    await client.query("ROLLBACK");
    throw err; 
  } finally {
    client.release();
  }
};