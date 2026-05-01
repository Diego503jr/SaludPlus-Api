const pool = require("../config/db");
const recetaMedicamentoModel = require("../models/recetaMedicamento.model");

exports.createReceta = async (data) => {
  
  const listaDetalles = Array.isArray(data) ? data : [data];

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const resultados = [];

    for (const detalle of listaDetalles) {
      // Validaciones
      if (!detalle.recetaId) throw new Error("El ID de la receta es requerido.");
      if (!detalle.medicamentoId) throw new Error("El ID del medicamento es requerido.");
      if (!detalle.dosis) throw new Error("La dosis es requerida.");
      if (!detalle.cantidad) throw new Error("La cantidad es requerida.");

      const nuevoRegistro = await recetaMedicamentoModel.createReceta(detalle, client);
      resultados.push(nuevoRegistro);
    }

    await client.query("COMMIT");
    return resultados;

  } catch (err) {
    await client.query("ROLLBACK");
    throw err; 
  } finally {
    client.release();
  }
};