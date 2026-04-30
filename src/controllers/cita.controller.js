const citaService = require("../services/cita.service");

// TODAS LAS CITAS DE MÉDICO LOGEADO
exports.GetAppointments = async (req, res) => {
    try {
        const userId = req.user.id;

        const appointments = await citaService.GetAppointments(userId);

        return res.status(200).json({
            data: appointments,
            message: "Citas de médico.",
            success: true
        });

    } catch (error) {
        console.error("Error en al obtener información de citas.", error.message);

        const statusCode = error.message.includes("No se encontró") ? 404 : 500;

        return res.status(statusCode).json({
            success: false,
            message: error.message || "Error interno del servidor"
        });
    }
};