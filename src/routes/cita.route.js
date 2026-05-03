const express = require('express');
const router = express.Router();

// Importamos el controlador de citas
const citaController = require('../controllers/cita.controller');

// RUTAS DEL PACIENTE

// RUTA: Obtener las próximas citas del paciente (Pendientes o Confirmadas)
router.get('/proximas/:pacienteId', citaController.obtenerProximasCitas);
//RUTA: Obtener lista de especialidad
router.get('/especialidades', citaController.getEspecialidades);
// RUTA: Obtener unidades médicas filtradas por especialidad
router.get('/unidades-medicas/:idEspecialidad', citaController.getUnidadesMedicas);
// RUTA: Obtener horas disponibles que no chocan
router.get('/horarios-disponibles', citaController.getHorarios);
// RUTA: Obtener historial completo (separado en Próximas y Pasadas)
router.get('/historial/:pacienteId', citaController.getHistorial);
// RUTA: Obtener unidades para el mapa con sus coordenadas
router.get('/unidades-mapa', citaController.getUnidadesMapa);
// RUTA: Obtener el perfil completo del paciente (Datos generales + ISSS)
router.get('/perfil/:pacienteId', citaController.getPerfilPaciente);

module.exports = router;