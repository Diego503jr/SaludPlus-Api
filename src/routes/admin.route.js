const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const medicoController = require("../controllers/medico.controller");
const pacienteController = require("../controllers/paciente.controller");

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

module.exports = router;
