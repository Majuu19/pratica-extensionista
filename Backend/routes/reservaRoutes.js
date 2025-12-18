const express = require("express");
const router = express.Router();

const cupomController = require("../controllers/cupomController");
const { verifyToken } = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

router.post("/", verifyToken, requireRole('associado'), cupomController.reservar);

module.exports = router;
