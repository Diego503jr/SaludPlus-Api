const citaModel = require("../models/cita.model");

//TODAS LAS CITAS DE MÉDICO
exports.GetAppointments = async (userId) => {
  //Obtenemos toda la información
  const agenda = await citaModel.GetAppointments(userId);

  //Si no hay información (no existen citas)
  if (!agenda || agenda.length === 0) {
    throw new Error("No se encontraron citas para este médico.");
  }

  //Devolvemos información
  return {
    citas: agenda,
  };
};

// SERVICIO PARA PROCESAR LAS PRÓXIMAS CITAS
exports.obtenerCitasProximas = async (idUsuario) => {
  try {
    // Llamamos al modelo
    const citas = await citaModel.obtenerProximasPorPaciente(idUsuario);

    if (citas.length === 0) {
      return [];
    }

    // Formateamos los datos para que el Frontend los reciba limpios
    const citasFormateadas = citas.map((cita) => {
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
        doctor: nombreDoctor,
      };
    });

    return citasFormateadas;
  } catch (error) {
    throw error;
  }
};

// PASO 3 (SOLICITAR CITA): SERVICIO DE HORARIOS

// Función auxiliar para sumar 30 minutos a las horas
const sumarMinutos = (horaString, minutosAAgregar) => {
  let [horas, minutos, segundos] = horaString.split(":").map(Number);
  minutos += minutosAAgregar;
  if (minutos >= 60) {
    horas += Math.floor(minutos / 60);
    minutos = minutos % 60;
  }
  const h = horas.toString().padStart(2, "0");
  const m = minutos.toString().padStart(2, "0");
  const s = (segundos || 0).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

exports.obtenerHorariosDisponibles = async (
  unidadId,
  especialidadId,
  fecha,
) => {
  try {
    // 1. Averiguar qué día de la semana es la fecha (Lunes = 1, Domingo = 7)
    const partesFecha = fecha.split("-"); // ej "2026-05-15" -> ["2026", "05", "15"]
    const fechaObj = new Date(
      partesFecha[0],
      partesFecha[1] - 1,
      partesFecha[2],
    );
    let diaSemana = fechaObj.getDay();
    diaSemana = diaSemana === 0 ? 7 : diaSemana; // En BD guardamos Domingo como 7

    // 2. Traer a qué hora abre y cierra la unidad ese día
    const horario = await citaModel.obtenerHorarioApertura(unidadId, diaSemana);

    // Si no hay horario, la clínica está cerrada ese día
    if (!horario) throw new Error("No hay horarios registrados.");

    // 3. Cuántos médicos atienden esta unidad + especialidad (médicos activos)
    const totalMedicos = await citaModel.contarMedicosDisponibles(
      unidadId,
      especialidadId,
    );

    // Si no hay ni un médico, no hay nada que ofrecer
    if (totalMedicos === 0) throw new Error("No hay medicos disponibles.");

    // 4. Cuántos médicos están ocupados POR cada hora
    //    ej. { "08:00:00": 2, "09:30:00": 1 }
    const ocupadasPorHora = await citaModel.obtenerOcupacionPorHora(
      unidadId,
      especialidadId,
      fecha,
    );

    // 5. Recorrer los bloques de 30 min y dejar solo donde quede algún médico libre
    const disponibles = [];
    let horaActual = horario.hora_inicio;
    const horaFin = horario.hora_fin;

    while (horaActual < horaFin) {
      const ocupados = ocupadasPorHora[horaActual] || 0;

      // Hay hueco mientras NO estén ocupados todos los médicos
      if (ocupados < totalMedicos) {
        // Le quitamos los segundos para que Android lo reciba bonito (ej. "08:30")
        disponibles.push(horaActual.substring(0, 5));
      }

      // Siguiente bloque
      horaActual = sumarMinutos(horaActual, 30);
    }

    if (!disponibles) throw new Error("No hay horarios disponibles.");

    return disponibles;
  } catch (error) {
    throw error;
  }
};

// HISTORIAL DE CITAS: SERVICIO PARA SEPARAR PRÓXIMAS Y PASADAS
exports.obtenerHistorialCitas = async (idUsuario) => {
  try {
    const citas = await citaModel.obtenerHistorialPaciente(idUsuario);

    const proximas = [];
    const pasadas = [];

    // Obtenemos la fecha de hoy a la medianoche para comparar correctamente
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Estados que consideramos como "activos" o próximos
    const estadosActivos = ["pendiente", "confirmada", "reprogramada"];

    citas.forEach((cita) => {
      //Unimos el nombre del doctor
      let nombreDoctor = "Por asignar";
      if (cita.doctor_nombre && cita.doctor_apellido) {
        nombreDoctor = `Dr. ${cita.doctor_nombre} ${cita.doctor_apellido}`;
      }

      const citaFormateada = {
        id: cita.cita_id,
        estado: cita.estado,
        especialidad_id: cita.especialidad_id,
        especialidad: cita.especialidad,
        unidad_medica_id: cita.unidad_medica_id,
        fecha_solicitada: cita.fecha_solicitada,
        hora_asignada: cita.hora_asignada || "Por asignar",
        unidad_medica: cita.unidad_medica,
        doctor: nombreDoctor,
      };

      const fechaCita = new Date(cita.fecha_solicitada);
      fechaCita.setHours(0, 0, 0, 0);

      if (estadosActivos.includes(cita.estado) && fechaCita >= hoy) {
        proximas.push(citaFormateada);
      } else {
        pasadas.push(citaFormateada);
      }
    });

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
    const unidadesFormateadas = unidades.map((unidad) => ({
      ...unidad,
      especialidades: unidad.especialidades || [],
    }));

    return unidadesFormateadas;
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
    if (error.code === "23505") {
      throw new Error(
        "Ya tienes una cita agendada en esa unidad, especialidad, fecha y hora.",
      );
    }
    throw error;
  }
};

// REPORTE HISTORICO CITAS
exports.historicoCitas = async (data) => {
  // Hacemos destructuring del id
  const { id } = data;

  let result = await citaModel.historicoCitas(id);

  if (!result) {
    const error = Error("Historico de citas no encontradas.");
    error.status = 404;
    throw error;
  }

  return result;
};

// HISTORICO DE CITAS POR PACIENTE
exports.historicoCitasPorPaciente = async (id) => {
  if (!id) {
    const error = new Error("El ID del paciente es requerido.");
    error.status = 400;
    throw error;
  }

  const result = await citaModel.historicoCitasPorPaciente(id);

  if (!result || result.length === 0) {
    const error = new Error(
      "No se encontró histórico de citas para este paciente.",
    );
    error.status = 404;
    throw error;
  }

  return result;
};

//MODIFICAR CITAS

exports.modificarCita = async (idCita, datos) => {
  try {
    let camposEfectivos = { ...datos };

    // Si se manda fecha y hora para cambiar, REPROGRAMACIÓN
    if (datos.fecha_solicitada && datos.hora_asignada && !datos.estado_id) {
      camposEfectivos.estado_id = 5;
    }

    const resultado = await citaModel.actualizarEstadoCita(
      idCita,
      camposEfectivos,
    );
    if (!resultado) {
      throw new Error("Cita no encontrada");
    }

    return resultado;
  } catch (error) {
    throw error;
  }
};
