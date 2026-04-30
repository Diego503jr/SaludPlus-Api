const router = require("express").Router();
const medicoController = require("../controllers/medico.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get('/profile', authMiddleware, medicoController.findMedicoLogged);

module.exports = router;