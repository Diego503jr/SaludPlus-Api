const router = require("express").Router();
const recetaMedicamentoController = require("../controllers/recetaMedicamento.controller");

router.post('/create/', recetaMedicamentoController.createDetalleReceta);

module.exports = router;