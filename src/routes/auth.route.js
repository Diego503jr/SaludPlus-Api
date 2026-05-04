const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");

router.post("/register/paciente", authController.registerPaciente);
router.post("/login", authController.login);

module.exports = router;
