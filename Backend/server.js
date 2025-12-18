require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const routes = require("./routes");


app.use(cors({ origin: true, allowedHeaders: ['Content-Type', 'Authorization'], exposedHeaders: ['Authorization'] }));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

