const db = require("../config/db");

async function listarCategorias() {
  const [rows] = await db.execute("SELECT * FROM categoria");
  return rows;
}

module.exports = { listarCategorias };
