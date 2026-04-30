const medicamentoModel = require("../models/medicamento.model");

//TODOS LOS MEDICAMENTOS / MEDICAMENTOS POR ID
exports.getMedicine = async (id=null) => {
   
    const medicine = await medicamentoModel.getMedicine(id);

    if (!medicine || medicine.length === 0) {
        throw new Error("No se encontraron medicamentos.");
    }

    return {
        medicamentos: medicine
    };
};