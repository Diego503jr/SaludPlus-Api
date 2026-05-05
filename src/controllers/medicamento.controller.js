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
            message: medicineId ? "Detalle del medicamento." : "Listado de todos los medicamentos.",
        });

    } catch (error) {
        //Error
        console.error("Error al obtener medicamentos:", error.message);
        const statusCode = error.message.includes("No se encontró") ? 404 : 500;

        return res.status(statusCode).json({
            success: false,
            message: error.message || "Error interno del servidor"
        });
    }
};