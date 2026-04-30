const router = require("express").Router();
const asistenciaController = require("../controllers/asistenciaCita.controller");


router.patch('/update/:id', asistenciaController.marcarAsistencia);

module.exports = router;