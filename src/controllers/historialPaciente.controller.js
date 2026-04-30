const historialPacienteService = require("../services/historialPaciente.service");

exports.updateHistorialPaciente = async (req, res) => {
    try {
        const { id } = req.params; 
        const data = req.body; 

        const result = await historialPacienteService.updateHistorialPaciente(id, data);

        return res.status(200).json({
            data: result,
            success: true,
            message: "Paciente actualizado correctamente."
        });

    } catch (error) {
        const statusCode = error.message.includes("No se encontró") ? 404 : 400;
        
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Error al procesar petición."
        });
    }
};