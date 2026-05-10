const express = require('express');
const router = express.Router();

// Importamos el controlador de citas
const citaController = require('../controllers/cita.controller');
const pacienteController = require('../controllers/paciente.controller');

// RUTAS DEL PACIENTE

// RUTA: Obtener las próximas citas del paciente (Pendientes o Confirmadas)
router.get('/proximas/:usuarioId', citaController.obtenerProximasCitas);

// RUTA: Obtener horas disponibles que no chocan
router.get('/horarios-disponibles', citaController.getHorarios);

// RUTA: Obtener historial completo (separado en Próximas y Pasadas)
router.get('/historial/:usuarioId', citaController.getHistorial);

// RUTA: Obtener unidades para el mapa con sus coordenadas
router.get('/unidades-mapa', citaController.getUnidadesMapa);

// RUTA: Guardar una cita nueva en la base de datos
router.post('/agendar', citaController.crearCita);

//RUTAS DE PERFIL

// RUTA: Actualizar datos de contacto y médicos del paciente
router.put('/perfil/:usuarioId', pacienteController.actualizarPerfilPaciente);

module.exports = router;
