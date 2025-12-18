require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const routes = require("./routes");

app.use(cors({ 
  origin: true, 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  exposedHeaders: ['Authorization'] 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 API
app.use("/api", routes);

// 🔹 FRONTEND (HTML / CSS / IMAGENS)
app.use(express.static(path.join(__dirname, "public")));

// 🔹 Página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔹 PORTA DO RENDER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
