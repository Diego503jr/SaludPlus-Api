const pool = require("../config/db");

//FUNCIÓN PARA CREAR DETALLE DE RECETA
exports.createReceta = async (detalleReceta, client) => {
  //Desestructuramos los datos recibidos
  const {
    recetaId,
    medicamentoId,
    dosis,
    duracionDias,
    cantidad,
    instrucciones,
  } = detalleReceta;

  //Consulta para la creación
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

  //Ejecutamos consulta 
  const response = await client.query(query, values);

  //Si no se puede crear detalle receta
  if (response.rowCount === 0) {
    throw new Error(`No se pudo insertar el medicamento ${medicamentoId}`);
  }

  //Devolvemos objeto
  return response.rows[0];
};