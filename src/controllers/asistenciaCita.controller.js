const asistenciaService = require("../services/asistenciaCita.service");

//FUNCIÓN PARA CAMBIAR EL ESTADO ASISTENCIA A CITA
exports.marcarAsistencia = async (req, res) => {
    try {
        //Obtenemos id enviado desde front y parámetros
        const { id } = req.params; 
        const data = req.body; 

        //Consulta al servicio, enviando id e información de campos
        const result = await asistenciaService.UpdateAsistencia(id, data);

        //Respuesta exitosa
        return res.status(200).json({
            success: true,
            data: result,
            message: "Asistencia actualizada correctamente."
        });

    } catch (error) {
        //Error
        const statusCode = error.message.includes("No se encontró") ? 404 : 400;
        
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Error al procesar la asistencia."
        });
    }
};