const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const medicoController = require("../controllers/medico.controller");
const pacienteController = require("../controllers/paciente.controller");
const unidadesMedicas = require("../controllers/unidadesMedicas.controller");

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

module.exports = router;
