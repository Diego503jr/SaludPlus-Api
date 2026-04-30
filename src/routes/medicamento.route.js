const router = require("express").Router();
const medicamentoController = require("../controllers/medicamento.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get('/get/:medicineId?', medicamentoController.getMedicine);

module.exports = router;