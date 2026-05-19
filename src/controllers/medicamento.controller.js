const medicamentoService = require("../services/medicamento.service");

// TODOS LOS MEDICAMENTOS / MEDICAMENTOS POR
exports.getMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params; // Puede venir o ser undefined

    // Llamamos al servicio pasando el ID (si no viene, será undefined/null)
    const medicine = await medicamentoService.getMedicine(medicineId);

    //Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: medicine,
      message: medicineId
        ? "Detalle del medicamento."
        : "Listado de todos los medicamentos.",
    });
  } catch (error) {
    //Error
    console.error("Error al obtener medicamentos:", error.message);
    const statusCode = error.message.includes("No se encontró") ? 404 : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
};

// Read de todos los medicamentos
exports.getMedicamentos = async (req, res) => {
  try {
    const data = await medicamentoService.readMedicamentos();

    return res.status(200).json({
      success: true,
      data: data,
      message: "Medicamentos obtenidos correctamente.",
    });
  } catch (err) {
    // Enviamos la data de error al front-end
    res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};

// Update medicamento by Id
exports.updateMedicamento = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtenemos la data que nos envia el front-end
    const data = await medicamentoService.updateMedicamento(id, req.body);

    // Enviamos la data al front-end
    res.status(201).json({
      success: true,
      data: data,
      message: "Medicamento actualizado correctamente.",
    });
  } catch (err) {
    // Enviamos la data de error al front-end
    res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};

// Delete medicamento (pasa a inactivo)
exports.deleteMedicamento = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await medicamentoService.deleteMedicamento(id);

    res.status(200).json({
      success: true,
      data: result,
      message: "Medicamento eliminado correctamente.",
    });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      data: {},
      message: err.message,
    });
  }
};
