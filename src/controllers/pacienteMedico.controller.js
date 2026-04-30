const pacienteService = require("../services/pacienteMedico.service");

// INFORMACIÓN DE PERFIL DE PACIENTE
exports.GetPatientInfo = async (req, res) => {
    try {
        const { patientId } = req.params;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "El ID del usuario es requerido."
            });
        }
        const patientProfile = await pacienteService.GetPatientInfo(patientId);

        return res.status(200).json({
            data: patientProfile,
            message: "Información de paciente.",
            success: true
        });

    } catch (error) {
        console.error("Error en al obtener información de paciente:", error.message);

        const statusCode = error.message.includes("No se encontró") ? 404 : 500;

        return res.status(statusCode).json({
            success: false,
            message: error.message || "Error interno del servidor"
        });
    }
};