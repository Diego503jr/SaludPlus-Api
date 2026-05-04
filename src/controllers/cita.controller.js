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


// SOLICITAR CITA: CONTROLADOR DE ESPECIALIDADES
exports.getEspecialidades = async (req, res) => {
    try {
        const especialidades = await citaService.obtenerEspecialidades();

        res.status(200).json({
            exito: true,
            datos: especialidades
        });

    } catch (error) {
        console.error("Error en getEspecialidades:", error);
        res.status(500).json({
            exito: false,
            mensaje: "Error interno del servidor"
        });
    }
};


//(SOLICITAR CITA): CONTROLADOR DE UNIDADES MÉDICAS
exports.getUnidadesMedicas = async (req, res) => {
    try {
        // Atrapamos el ID de la especialidad que viene en la URL
        const idEspecialidad = req.params.idEspecialidad;

        if (!idEspecialidad) {
            return res.status(400).json({
                exito: false,
                mensaje: "El ID de la especialidad es requerido"
            });
        }

        const unidades = await citaService.obtenerUnidades(idEspecialidad);

        res.status(200).json({
            exito: true,
            datos: unidades
        });

    } catch (error) {
        console.error("Error en getUnidadesMedicas:", error);
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
        const idPaciente = req.params.pacienteId;

        if (!idPaciente) {
            return res.status(400).json({
                exito: false,
                mensaje: "El ID del paciente es requerido"
            });
        }

        const historial = await citaService.obtenerHistorialCitas(idPaciente);

        res.status(200).json({
            exito: true,
            datos: historial
        });

    } catch (error) {
        console.error("Error en getHistorial:", error);
        res.status(500).json({
            exito: false,
            mensaje: "Error interno del servidor"
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
// PERFIL DEL PACIENTE: CONTROLADOR
// ==========================================
exports.getPerfilPaciente = async (req, res) => {
    try {
        const idPaciente = req.params.pacienteId;

        if (!idPaciente) {
            return res.status(400).json({
                exito: false,
                mensaje: "El ID del paciente es requerido"
            });
        }

        const perfil = await citaService.obtenerPerfil(idPaciente);

        if (!perfil) {
            return res.status(404).json({
                exito: false,
                mensaje: "Paciente no encontrado"
            });
        }

        res.status(200).json({
            exito: true,
            datos: perfil
        });

    } catch (error) {
        console.error("Error en getPerfilPaciente:", error);
        res.status(500).json({
            exito: false,
            mensaje: "Error interno del servidor al cargar el perfil"
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

// ==========================================
// EDITAR PERFIL (PUT): CONTROLADOR
// ==========================================
exports.actualizarPerfilPaciente = async (req, res) => {
    try {
        const idPaciente = req.params.pacienteId;
        const datosBody = req.body;

        if (!idPaciente) {
            return res.status(400).json({
                exito: false,
                mensaje: "El ID del paciente es requerido en la URL"
            });
        }

        await citaService.editarPerfil(idPaciente, datosBody);

        res.status(200).json({
            exito: true,
            mensaje: "¡Datos del perfil actualizados con éxito!"
        });

    } catch (error) {
        console.error("Error en actualizarPerfilPaciente:", error);
        
        if (error.message === 'Paciente no encontrado') {
            return res.status(404).json({
                exito: false,
                mensaje: error.message
            });
        }

        res.status(500).json({
            exito: false,
            mensaje: "Error interno del servidor al actualizar el perfil"
        });
    }
};