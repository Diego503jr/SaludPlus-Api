const router = require("express").Router();
const recetaController = require("../controllers/receta.controller");
const authMiddleware = require("../middlewares/auth.middleware");


router.post('/create/:id', authMiddleware, recetaController.createReceta);

module.exports = router;