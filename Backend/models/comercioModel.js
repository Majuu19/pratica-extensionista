const db = require("../config/db");

async function criarComercio({
  razao_social,
  nome_fantasia,
  cnpj,
  email,
  senhaHash,
  categoria_id
}) {
  const sql = `
    INSERT INTO comercio
    (razao_social, nome_fantasia, cnpj, email, senha_hash, categoria_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.execute(sql, [
    razao_social,
    nome_fantasia,
    cnpj,
    email,
    senhaHash,
    categoria_id
  ]);

  return result.insertId;
}

async function buscarPorCNPJ(cnpj) {
  const [rows] = await db.execute(
    "SELECT * FROM comercio WHERE cnpj = ?",
    [cnpj]
  );
  return rows[0];
}

async function buscarPorEmail(email) {
  const [rows] = await db.execute(
    "SELECT * FROM comercio WHERE email = ?",
    [email]
  );
  return rows[0];
}

module.exports = {
  criarComercio,
  buscarPorCNPJ,
  buscarPorEmail
};
