const db = require("../config/db");

async function loginAssociado(cpf) {
  const [rows] = await db.execute(
    "SELECT id, nome, senha_hash FROM associado WHERE cpf = ?",
    [cpf]
  );
  return rows.length ? rows[0] : null;
}

async function loginComerciante(cnpj) {
  const [rows] = await db.execute(
    "SELECT id, nome_fantasia AS nome, senha_hash FROM comercio WHERE cnpj = ?",
    [cnpj]
  );
  return rows.length ? rows[0] : null;
}

module.exports = {
  loginAssociado,
  loginComerciante
};
