const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

// Importamos el controlador de citas
const citaController = require("../controllers/cita.controller");
const pacienteController = require("../controllers/paciente.controller");

// RUTAS DEL PACIENTE

// RUTA: Obtener las próximas citas del paciente (Pendientes o Confirmadas)
router.get(
  "/proximas/:usuarioId",
  authMiddleware,
  citaController.obtenerProximasCitas,
);

// RUTA: Obtener horas disponibles que no chocan
router.get("/horarios-disponibles", authMiddleware, citaController.getHorarios);

// RUTA: Obtener historial completo (separado en Próximas y Pasadas)
router.get(
  "/historial/:usuarioId",
  authMiddleware,
  citaController.getHistorial,
);

// RUTA: Obtener unidades para el mapa con sus coordenadas
router.get("/unidades-mapa", authMiddleware, citaController.getUnidadesMapa);

// RUTA: Guardar una cita nueva en la base de datos
router.post("/agendar", authMiddleware, citaController.crearCita);

//RUTAS DE PERFIL

// RUTA: Actualizar datos de contacto y médicos del paciente
router.put(
  "/perfil/:usuarioId",
  authMiddleware,
  pacienteController.actualizarPerfilPaciente,
);

// RUTA: Cancelar o Reprogramar una cita
router.patch(
  '/actualizar-cita/:citaId', 
  authMiddleware, 
  citaController.actualizarCitaUnico
);

module.exports = router;
