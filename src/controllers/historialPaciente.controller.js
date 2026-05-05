const historialPacienteService = require("../services/historialPaciente.service");

//FUNCIÓN PARA ACTUALIZAR DATOS CLINICOS DE PACIENTE
exports.updateHistorialPaciente = async (req, res) => {
    try {
        //Obtenemos id de paciente e información clinica
        const { id } = req.params; 
        const data = req.body; 

        //Consulta al servicio pasando id e información
        const result = await historialPacienteService.updateHistorialPaciente(id, data);

        //Respuesta exitosa
        return res.status(200).json({
            data: result,
            success: true,
            message: "Paciente actualizado correctamente."
        });

    } catch (error) {
        //Error
        const statusCode = error.message.includes("No se encontró") ? 404 : 400;
        
        return res.status(statusCode).json({
            success: false,
            message: error.message || "Error al procesar petición."
        });
    }
};