const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");

const medicoController = require("../controllers/medico.controller");
const asistenciaController = require("../controllers/asistenciaCita.controller");
const citaController = require("../controllers/cita.controller");
const historialPacienteController = require("../controllers/historialPaciente.controller");
const medicamentoController = require("../controllers/medicamento.controller");
const paciente = require("../controllers/paciente.controller");
const recetaController = require("../controllers/receta.controller");
const recetaMedicamentoController = require("../controllers/recetaMedicamento.controller");

router.get("/profile", authMiddleware, medicoController.findMedicoLogged);
router.patch("/asistencia/update/:id", asistenciaController.marcarAsistencia);
router.get(
  "/citas/allAppointments",
  authMiddleware,
  citaController.GetAppointments,
);
router.patch(
  "/paciente/historial/update/:id",
  authMiddleware,
  historialPacienteController.updateHistorialPaciente,
);
router.get(
  "/medicina/:medicineId?",
  authMiddleware,
  medicamentoController.getMedicine,
);
router.get(
  "/historialPaciente/information/:patientId",
  authMiddleware,
  paciente.GetPatientInfo,
);
router.post(
  "/receta/create/:id",
  authMiddleware,
  recetaController.createReceta,
);
router.post(
  "/receta/medicamento/create/",
  authMiddleware,
  recetaMedicamentoController.createDetalleReceta,
);
router.get(
  "/reports/citas/paciente/:id",
  authMiddleware,
  citaController.historicoCitasPorPaciente,
);

module.exports = router;
