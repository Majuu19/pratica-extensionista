const express = require("express");
const router = express.Router();

const cupomController = require("../controllers/cupomController");
const { verifyToken } = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

router.get("/", cupomController.listarDisponiveis);
router.get("/listar", cupomController.listarDisponiveis);

router.get("/categorias", cupomController.listarCategorias);


router.post("/criar", verifyToken, requireRole('comerciante'), cupomController.criarCupom);

router.post("/", verifyToken, requireRole('comerciante'), cupomController.criarCupom);


router.post("/reservar", verifyToken, requireRole('associado'), cupomController.reservar);


router.post("/usar", verifyToken, requireRole('comerciante'), cupomController.registrarUso);


router.get("/meus", verifyToken, requireRole('associado'), cupomController.meusCupons);

module.exports = router;
