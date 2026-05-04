const citaModel = require("../models/cita.model");

//TODAS LAS CITAS DE MÉDICO
exports.GetAppointments = async (userId) => {
   
    const agenda = await citaModel.GetAppointments(userId);

    if (!agenda || agenda.length === 0) {
        throw new Error("No se encontraron citas para este médico.");
    }

    return {
        citas: agenda
    };
};

// SERVICIO PARA PROCESAR LAS PRÓXIMAS CITAS
exports.obtenerCitasProximas = async (idPaciente) => {
    try {
        // Llamamos al modelo
        const citas = await citaModel.obtenerProximasPorPaciente(idPaciente);
        
        if (citas.length === 0) {
            return [];
        }

        // Formateamos los datos para que el Frontend los reciba limpios
        const citasFormateadas = citas.map(cita => {
            let nombreDoctor = "Por asignar";
            
            // Si hay un doctor asignado, unimos nombre y apellido
            if (cita.doctor_nombre && cita.doctor_apellido) {
                nombreDoctor = `Dr. ${cita.doctor_nombre} ${cita.doctor_apellido}`;
            }

            return {
                id: cita.cita_id,
                especialidades: cita.especialidad,
                fecha_solicitada: cita.fecha_solicitada,
                hora_asignada: cita.hora_asignada || "Por asignar",
                unidades_medicas: cita.unidad_medica,
                doctor: nombreDoctor
            };
        });

        return citasFormateadas;
    } catch (error) {
        throw error;
    }
};

//SOLICITAR CITA): SERVICIO DE ESPECIALIDADES

exports.obtenerEspecialidades = async () => {
    try {
        const especialidades = await citaModel.obtenerEspecialidadesActivas();
        return especialidades;
    } catch (error) {
        throw error;
    }
};


//(SOLICITAR CITA): SERVICIO DE UNIDADES MÉDICAS
exports.obtenerUnidades = async (idEspecialidad) => {
    try {
        const unidades = await citaModel.obtenerUnidadesPorEspecialidad(idEspecialidad);
        return unidades;
    } catch (error) {
        throw error;
    }
};

// PASO 3 (SOLICITAR CITA): SERVICIO DE HORARIOS

// Función auxiliar para sumar 30 minutos a las horas
const sumarMinutos = (horaString, minutosAAgregar) => {
    let [horas, minutos, segundos] = horaString.split(':').map(Number);
    minutos += minutosAAgregar;
    if (minutos >= 60) {
        horas += Math.floor(minutos / 60);
        minutos = minutos % 60;
    }
    const h = horas.toString().padStart(2, '0');
    const m = minutos.toString().padStart(2, '0');
    const s = (segundos || 0).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

exports.obtenerHorariosDisponibles = async (unidadId, especialidadId, fecha) => {
    try {
        // 1. Averiguar qué día de la semana es la fecha (Lunes = 1, Domingo = 7)
        const partesFecha = fecha.split('-'); // ej "2026-05-15" -> ["2026", "05", "15"]
        const fechaObj = new Date(partesFecha[0], partesFecha[1] - 1, partesFecha[2]);
        let diaSemana = fechaObj.getDay();
        diaSemana = diaSemana === 0 ? 7 : diaSemana; // En BD guardamos Domingo como 7

        // 2. Traer a qué hora abre y cierra
        const horario = await citaModel.obtenerHorarioApertura(unidadId, diaSemana);
        
        // Si no hay horario, significa que la clínica está cerrada ese día
        if (!horario) return [];

        // 3. Traer las horas que ya están reservadas
        const horasOcupadas = await citaModel.obtenerHorasOcupadas(unidadId, especialidadId, fecha);

        // 4. Calcular los espacios disponibles (Citas cada 30 minutos)
        const disponibles = [];
        let horaActual = horario.hora_inicio;
        const horaFin = horario.hora_fin;

        while (horaActual < horaFin) {
            // Si la hora actual NO está en el arreglo de ocupadas, está disponible
            if (!horasOcupadas.includes(horaActual)) {
                // Le quitamos los segundos para que Android lo reciba bonito (ej. "08:30")
                disponibles.push(horaActual.substring(0, 5));
            }
            // Le sumamos 30 minutos para evaluar el siguiente bloque
            horaActual = sumarMinutos(horaActual, 30);
        }

        return disponibles;
    } catch (error) {
        throw error;
    }
};

// HISTORIAL DE CITAS: SERVICIO PARA SEPARAR PRÓXIMAS Y PASADAS
exports.obtenerHistorialCitas = async (idPaciente) => {
    try {
        const citas = await citaModel.obtenerHistorialCompleto(idPaciente);
        
        const proximas = [];
        const pasadas = [];
        
        // Obtenemos la fecha de hoy a la medianoche para comparar correctamente
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Estados que consideramos como "activos" o próximos
        const estadosActivos = ['pendiente', 'confirmada', 'reprogramada'];

        citas.forEach(cita => {
            //Unimos el nombre del doctor
            let nombreDoctor = "Por asignar";
            if (cita.doctor_nombre && cita.doctor_apellido) {
                nombreDoctor = `Dr. ${cita.doctor_nombre} ${cita.doctor_apellido}`;
            }

            //Formateamos el objeto tal como lo pide el Frontend
            const citaFormateada = {
                id: cita.cita_id,
                estado: cita.estado,
                especialidad: cita.especialidad,
                fecha_solicitada: cita.fecha_solicitada,
                hora_asignada: cita.hora_asignada || "Por asignar",
                unidad_medica: cita.unidad_medica,
                doctor: nombreDoctor
            };

            // 3. Lógica de separación
            const fechaCita = new Date(cita.fecha_solicitada);
            fechaCita.setHours(0, 0, 0, 0);

            if (estadosActivos.includes(cita.estado) && fechaCita >= hoy) {
                proximas.push(citaFormateada);
            } else {
                pasadas.push(citaFormateada);
            }
        });

        // Devolvemos un objeto con los dos arreglos
        return { proximas, pasadas };

    } catch (error) {
        throw error;
    }
};

// MAPA DE UNIDADES: SERVICIO
exports.obtenerUnidadesMapa = async () => {
    try {
        const unidades = await citaModel.obtenerUnidadesParaMapa();

        // Limpiamos los datos asegurándonos de que si especialidades viene vacío, sea un arreglo [] y no un null
        const unidadesFormateadas = unidades.map(unidad => ({
            ...unidad,
            especialidades: unidad.especialidades || []
        }));

        return unidadesFormateadas;
    } catch (error) {
        throw error;
    }
};


// PERFIL DEL PACIENTE: SERVICIO
exports.obtenerPerfil = async (idPaciente) => {
    try {
        const perfil = await citaModel.obtenerPerfilPaciente(idPaciente);
        
        if (!perfil) {
            return null; // Si no existe, devolvemos null 
        }

        // Limpiamos los datos nulos
        return {
            ...perfil,
            telefono: perfil.telefono || "No registrado",
            tipo_sangre: perfil.tipo_sangre || "No especificado",
            alergias: perfil.alergias || "Ninguna registrada",
            condiciones_cronicas: perfil.condiciones_cronicas || "Ninguna registrada"
        };

    } catch (error) {
        throw error;
    }
};

// ==========================================
// GUARDAR CITA (POST): SERVICIO
// ==========================================
exports.agendarCita = async (citaData) => {
    try {
        const nuevaCita = await citaModel.crearCita(citaData);
        return nuevaCita;
    } catch (error) {
        // Si hay un error de unicidad (el paciente intenta agendar dos veces a la misma hora)
        if (error.code === '23505') { 
            throw new Error('Ya tienes una cita agendada en esa unidad, especialidad, fecha y hora.');
        }
        throw error;
    }
};

// ==========================================
// EDITAR PERFIL (PUT): SERVICIO
// ==========================================
exports.editarPerfil = async (idPaciente, datos) => {
    try {
        await citaModel.actualizarPerfil(idPaciente, datos);
        
        // Opcional: Podrías retornar el perfil actualizado completo llamando a la función que hicimos antes
        return { mensaje: "Perfil actualizado correctamente" };
    } catch (error) {
        if (error.message === 'Paciente no encontrado') {
            throw error;
        }
        throw new Error('Error al actualizar en la base de datos');
    }
};