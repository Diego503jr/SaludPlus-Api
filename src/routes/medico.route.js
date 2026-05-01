const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");

const medicoController = require("../controllers/medico.controller");
const asistenciaController = require("../controllers/asistenciaCita.controller");
const citaController = require("../controllers/cita.controller");
const historialPacienteController = require("../controllers/historialPaciente.controller");
const medicamentoController = require("../controllers/medicamento.controller");
const pacienteController = require("../controllers/pacienteMedico.controller");
const recetaController = require("../controllers/receta.controller");
const recetaMedicamentoController = require("../controllers/recetaMedicamento.controller");


router.get('/profile', authMiddleware, medicoController.findMedicoLogged);
router.patch('/update/:id', asistenciaController.marcarAsistencia);
router.get('/allAppointments', authMiddleware, citaController.GetAppointments);
router.patch('/historial/update/:id', historialPacienteController.updateHistorialPaciente);
router.get('/get/:medicineId?', medicamentoController.getMedicine);
router.get('/information/:patientId', pacienteController.GetPatientInfo);
router.post('/create/:id', authMiddleware, recetaController.createReceta);
router.post('/create/', recetaMedicamentoController.createDetalleReceta);

module.exports = router;