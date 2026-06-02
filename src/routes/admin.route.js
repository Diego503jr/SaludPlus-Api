const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const medicoController = require("../controllers/medico.controller");
const pacienteController = require("../controllers/paciente.controller");
const unidadesMedicas = require("../controllers/unidadesMedicas.controller");
const medicamentos = require("../controllers/medicamento.controller");
const unidadEspecialidad = require("../controllers/unidadEspecialidad.controller");
const citas = require("../controllers/cita.controller");

// ROUTES MEDICOS
router.post("/medicos/create", authMiddleware, medicoController.registerMedico);
router.get("/medicos/read", authMiddleware, medicoController.getMedicos);
router.put(
  "/medicos/update/:id",
  authMiddleware,
  medicoController.updateMedico,
);
router.delete(
  "/medicos/delete/:id",
  authMiddleware,
  medicoController.deleteMedico,
);

//ROUTES PACIENTES
router.get("/pacientes/read", authMiddleware, pacienteController.getPacientes);
router.post(
  "/pacientes/update/:id",
  authMiddleware,
  pacienteController.updatePaciente,
);
router.delete(
  "/pacientes/delete/:id",
  authMiddleware,
  pacienteController.deletePaciente,
);

//ROUTES UNIDADES MEDICAS
router.post(
  "/unidades_medicas/create",
  authMiddleware,
  unidadesMedicas.registerUnidadMedica,
);
router.get(
  "/unidades_medicas/read",
  authMiddleware,
  unidadesMedicas.getUnidadesMedicas,
);
router.put(
  "/unidades_medicas/update/:id",
  authMiddleware,
  unidadesMedicas.updateUnidadMedica,
);
router.delete(
  "/unidades_medicas/delete/:id",
  authMiddleware,
  unidadesMedicas.deleteUnidadMedica,
);

// ROUTES MEDICAMENTO
router.get("/medicamentos/read", authMiddleware, medicamentos.getMedicamentos);
router.put(
  "/medicamentos/update/:id",
  authMiddleware,
  medicamentos.updateMedicamento,
);
router.delete(
  "/medicamentos/delete/:id",
  authMiddleware,
  medicamentos.deleteMedicamento,
);

// ROUTES UNIDADES ESPECIALIDAD
router.post(
  "/unidad_especialidad/create",
  authMiddleware,
  unidadEspecialidad.registerUnidadEspecialidad,
);
router.get(
  "/unidad_especialidad/read",
  authMiddleware,
  unidadEspecialidad.getUnidadesEspecialidad,
);
router.put(
  "/unidad_especialidad/update/:id",
  authMiddleware,
  unidadEspecialidad.updateUnidadEspecialidad,
);
router.delete(
  "/unidad_especialidad/delete/:id",
  authMiddleware,
  unidadEspecialidad.deleteUnidadEspecialidad,
);

// REPORTE HISTORICO DE CITAS
router.get("/estadisticas/historico_citas", citas.historicoCitas);

module.exports = router;
