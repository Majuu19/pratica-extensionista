const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const cupomRoutes = require("./cupomRoutes");
const reservaRoutes = require("./reservaRoutes");
const usoRoutes = require("./usoRoutes");

router.use("/auth", authRoutes);
router.use("/cupom", cupomRoutes);
router.use("/reserva", reservaRoutes);
router.use("/uso", usoRoutes);

module.exports = router;
