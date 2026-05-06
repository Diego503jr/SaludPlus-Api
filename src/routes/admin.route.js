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

module.exports = router;
