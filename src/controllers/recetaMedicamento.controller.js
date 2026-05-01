const recetaMedicamentoService = require("../services/recetaMedicamento.service");

exports.createDetalleReceta = async (req, res) => {
    try {
        const medicamentos = req.body;

        if (!Array.isArray(medicamentos)) {
            return res.status(400).json({
                success: false,
                message: "El cuerpo de la petición debe ser un arreglo de medicamentos."
            });
        }

        const resultados = await recetaMedicamentoService.createReceta(medicamentos);

        return res.status(201).json({
            success: true,
            message: `${resultados.length} medicamento(s) agregados exitosamente.`,
            data: resultados
        });

    } catch (error) {
        console.error("Error en el controlador de detalle:", error.message);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};