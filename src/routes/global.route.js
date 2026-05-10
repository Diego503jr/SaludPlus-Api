const router = require("express").Router();
const globalController = require("../controllers/global.controller");

router.get("/roles/catalogos", globalController.getRoles);
router.get("/especialidades/catalogos", globalController.getEspecialidades);
router.get("/unidades_medicas/catalogos", globalController.getUnidadesMedicas);
// RUTA: Obtener unidades médicas filtradas por especialidad
router.get('/unidades-medicas/:idEspecialidad', globalController.getUnidadesPorEspecialidad);

module.exports = router;
