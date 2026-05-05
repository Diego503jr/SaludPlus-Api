const medicamentoModel = require("../models/medicamento.model");

//TODOS LOS MEDICAMENTOS / MEDICAMENTOS POR ID
exports.getMedicine = async (id=null) => {
   
    //Consulta al modelo para obtener un medicamento por id o todos los medicamentos
    const medicine = await medicamentoModel.getMedicine(id);

    //No se encuentran medicamentos
    if (!medicine || medicine.length === 0) {
        throw new Error("No se encontraron medicamentos.");
    }

    //Devolvemos información
    return {
        medicamentos: medicine
    };
};