const asistenciaService = require("../services/asistenciaCita.service");

exports.marcarAsistencia = async (req, res) => {
    try {
        const { id } = req.params; 
        const data = req.body; 

        const result = await asistenciaService.UpdateAsistencia(id, data);

        return res.status(200).json({
            success: true,
            data: result,
            message: "Asistencia actualizada correctamente."
        });

    } catch (error) {
        const statusCode = error.message.includes("No se encontró") ? 404 : 400;
        
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Error al procesar la asistencia."
        });
    }
};