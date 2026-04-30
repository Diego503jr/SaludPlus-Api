const router = require("express").Router();
const citaController = require("../controllers/cita.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get('/allAppointments', authMiddleware, citaController.GetAppointments);

module.exports = router;