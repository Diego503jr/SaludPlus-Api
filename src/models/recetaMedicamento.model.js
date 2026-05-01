const pool = require("../config/db");

exports.createReceta = async (detalleReceta, client) => {
  const {
    recetaId,
    medicamentoId,
    dosis,
    duracionDias,
    cantidad,
    instrucciones,
  } = detalleReceta;

  const query = `
    INSERT INTO receta_medicamento (
      receta_id, 
      medicamento_id, 
      dosis, 
      duracion_dias, 
      cantidad, 
      instrucciones
    ) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING receta_id AS recetaId, medicamento_id AS medicamentoId, dosis, duracion_dias AS duracionDias, cantidad, instrucciones;`;

  const values = [
    recetaId,
    medicamentoId,
    dosis,
    duracionDias || null,
    cantidad,
    instrucciones || null,
  ];

  const response = await client.query(query, values);

  if (response.rowCount === 0) {
    throw new Error(`No se pudo insertar el medicamento ${medicamentoId}`);
  }

  return response.rows[0];
};