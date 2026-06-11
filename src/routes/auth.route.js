const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");

router.post("/register/paciente", authController.registerPaciente);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh_token", authController.refresh);

module.exports = router;
