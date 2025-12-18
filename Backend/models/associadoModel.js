const db = require("../config/db");

/**
 * Criar um novo associado no banco de dados.
 * @param {Object} params
 * @param {string} params.nome - Nome do associado.
 * @param {string} params.cpf - CPF do associado.
 * @param {string} params.email - E-mail do associado.
 * @param {string} params.senhaHash - Senha criptografada do associado.
 * @returns {number} - ID do associado criado.
 */
async function criarAssociado({ nome, cpf, email, senhaHash }) {
  const sql = `
    INSERT INTO associado (nome, cpf, email, senha_hash)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await db.execute(sql, [nome, cpf, email, senhaHash]);
  return result.insertId;
}

/**
 * Buscar um associado pelo CPF.
 * @param {string} cpf - CPF do associado.
 * @returns {Object|null} - Retorna o associado se encontrado ou null.
 */
async function buscarPorCPF(cpf) {
  const [rows] = await db.execute("SELECT * FROM associado WHERE cpf = ?", [cpf]);
  return rows.length > 0 ? rows[0] : null; 
}

/**
 * Buscar um associado pelo e-mail.
 * @param {string} email - E-mail do associado.
 * @returns {Object|null} - Retorna o associado se encontrado ou null.
 */
async function buscarPorEmail(email) {
  const [rows] = await db.execute("SELECT * FROM associado WHERE email = ?", [email]);
  return rows.length > 0 ? rows[0] : null; 
}

module.exports = {
  criarAssociado,
  buscarPorCPF,
  buscarPorEmail
};
