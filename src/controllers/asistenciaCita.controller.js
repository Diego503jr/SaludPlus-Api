const asistenciaService = require("../services/asistenciaCita.service");

//FUNCIÓN PARA CAMBIAR EL ESTADO ASISTENCIA A CITA
exports.marcarAsistencia = async (req, res) => {
    try {
        //Obtenemos id enviado desde front y parámetros
        const { id } = req.params; 
        const data = req.body; 

        const medicoId = req.user.id;

        //Consulta al servicio, enviando id e información de campos
        const result = await asistenciaService.updateAsistido(id, data, medicoId);

        //Respuesta exitosa
        return res.status(201).json({
            success: true,
            data: result,
            message: "Asistencia registrada correctamente."
        });

    } catch (error) {
        //Error
        console.error("ERROR ASISTENCIA:", error.message);
        const statusCode = error.message.includes("No se pudo registrar") ? 404 : 400;
        
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};