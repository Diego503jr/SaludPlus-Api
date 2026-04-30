const router = require("express").Router();
const pacienteController = require("../controllers/pacienteMedico.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get('/information/:patientId', pacienteController.GetPatientInfo);

module.exports = router;