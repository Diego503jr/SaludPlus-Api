const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const medicoController = require("../controllers/medico.controller");
const pacienteController = require("../controllers/paciente.controller");

router.post("/medicos/create", medicoController.registerMedico);
router.get("/medicos/read", medicoController.getMedicos);
router.put("/medicos/update/:id", medicoController.updateMedico);
router.delete("/medicos/delete/:id", medicoController.deleteMedico);
router.get("/pacientes/read", pacienteController.getPacientes);
router.post("/pacientes/update/:id", pacienteController.updatePaciente);
router.delete("/pacientes/delete/:id", pacienteController.deletePaciente);

module.exports = router;
