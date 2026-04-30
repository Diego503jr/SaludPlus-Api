const router = require("express").Router();
const historialPacienteController = require("../controllers/historialPaciente.controller");


router.patch('/update/:id', historialPacienteController.updateHistorialPaciente);

module.exports = router;