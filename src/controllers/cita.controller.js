const citaService = require("../services/cita.service");

// TODAS LAS CITAS DE MÉDICO LOGEADO
exports.GetAppointments = async (req, res) => {
    try {
        //Id de médico por token
        const userId = req.user.id;

        //Consulta al servicio
        const appointments = await citaService.GetAppointments(userId);

        //Respuesta exitosa
        return res.status(200).json({
            data: appointments,
            message: "Citas de médico.",
            success: true
        });

    } catch (error) {
        //Error
        console.error("Error en al obtener información de citas.", error.message);

        const statusCode = error.message.includes("No se encontró") ? 404 : 500;

        return res.status(statusCode).json({
            success: false,
            message: error.message || "Error interno del servidor"
        });
    }
};

// CONTROLADOR PARA ENVIAR LA RESPUESTA AL FRONTEND
exports.obtenerProximasCitas = async (req, res) => {
    try {
        // Obtenemos el ID del paciente desde la URL
        const idPaciente = req.params.pacienteId;

        if (!idPaciente) {
            return res.status(400).json({
                exito: false,
                mensaje: "El ID del paciente es requerido"
            });
        }

        const proximasCitas = await citaService.obtenerCitasProximas(idPaciente);

        res.status(200).json({
            exito: true,
            datos: proximasCitas
        });

    } catch (error) {
        console.error("Error en obtenerProximasCitas:", error);
        res.status(500).json({
            exito: false,
            mensaje: "Error interno del servidor"
        });
    }
};


// PASO 3 (SOLICITAR CITA): CONTROLADOR DE HORARIOS
exports.getHorarios = async (req, res) => {
    try {
        // Atrapamos los parámetros de la URL tipo ?unidadId=1&especialidadId=1&fecha=2026-05-15
        const { unidadId, especialidadId, fecha } = req.query;

        if (!unidadId || !especialidadId || !fecha) {
            return res.status(400).json({
                exito: false,
                mensaje: "Faltan parámetros (unidadId, especialidadId, fecha)"
            });
        }

        const horarios = await citaService.obtenerHorariosDisponibles(unidadId, especialidadId, fecha);

        res.status(200).json({
            exito: true,
            datos: horarios
        });

    } catch (error) {
        console.error("Error en getHorarios:", error);
        res.status(500).json({
            exito: false,
            mensaje: "Error interno del servidor al calcular horarios"
        });
    }
};

// HISTORIAL DE CITAS: CONTROLADOR
exports.getHistorial = async (req, res) => {
    try {
        const idUsuario = req.params.usuarioId;

        if (!idUsuario) {
            return res.status(400).json({
                exito: false,
                mensaje: "El ID del usuario es requerido"
            });
        }

        const historial = await citaService.obtenerHistorialCitas(idUsuario);

        res.status(200).json({
            exito: true,
            datos: historial
        });

    } catch (error) {
        console.error("Error en getHistorial:", error);
        res.status(500).json({
            exito: false,
            mensaje: "Error interno del servidor al obtener el historial"
        });
    }
};

// MAPA DE UNIDADES: CONTROLADOR
exports.getUnidadesMapa = async (req, res) => {
    try {
        const unidades = await citaService.obtenerUnidadesMapa();

        res.status(200).json({
            exito: true,
            datos: unidades
        });

    } catch (error) {
        console.error("Error en getUnidadesMapa:", error);
        res.status(500).json({
            exito: false,
            mensaje: "Error interno del servidor al cargar el mapa"
        });
    }
};


// ==========================================
// GUARDAR CITA (POST): CONTROLADOR
// ==========================================
exports.crearCita = async (req, res) => {
    try {
        const {
            paciente_id,
            especialidad_id,
            unidad_medica_id,
            fecha_solicitada,
            hora_asignada,
            motivo_consulta
        } = req.body;

        // Validar que el frontend nos mande todos los campos requeridos
        if (!paciente_id || !especialidad_id || !unidad_medica_id || !fecha_solicitada || !hora_asignada || !motivo_consulta) {
            return res.status(400).json({
                exito: false,
                mensaje: "Faltan datos obligatorios para agendar la cita"
            });
        }

        const nuevaCita = await citaService.agendarCita(req.body);

        res.status(201).json({
            exito: true,
            mensaje: "¡Cita agendada correctamente!",
            datos: nuevaCita
        });

    } catch (error) {
        console.error("Error en crearCita:", error);

        // Manejo del error de cita duplicada que mandamos desde el servicio
        if (error.message.includes('Ya tienes una cita')) {
            return res.status(409).json({
                exito: false,
                mensaje: error.message
            });
        }

        res.status(500).json({
            exito: false,
            mensaje: "Error interno del servidor al crear la cita"
        });
    }
};

