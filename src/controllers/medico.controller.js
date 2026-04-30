const medicoService = require("../services/medico.service");

// INFORMACIÓN DE PERFIL DE MÉDICO LOGEADO
exports.findMedicoLogged = async (req, res) => {
    try {
        const userId = req.user.id;

        const perfilMedico = await medicoService.findMedicoLogged(userId);

        return res.status(200).json({
            data: perfilMedico,
            message: "Información de médico.",
            success: true
        });

    } catch (error) {
        console.error("Error en al obtener información de médico:", error.message);

        const statusCode = error.message.includes("No se encontró") ? 404 : 500;

        return res.status(statusCode).json({
            success: false,
            message: error.message || "Error interno del servidor"
        });
    }
};
