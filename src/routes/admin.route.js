const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const medicoController = require("../controllers/medico.controller");

router.post("/medicos/create", authMiddleware, medicoController.registerMedico);
router.get("/medicos/read", authMiddleware, medicoController.getMedicos);
router.put(
  "/medicos/update/:id",
  authMiddleware,
  medicoController.updateMedico,
);
router.delete(
  "/medicos/delete/:id",
  authMiddleware,
  medicoController.deleteMedico,
);

module.exports = router;
