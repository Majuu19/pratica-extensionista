const db = require("../config/db");


async function criarCupom(data) {
  const sql = `
    INSERT INTO cupom (
      comercio_id,
      categoria_id,
      titulo,
      codigo,
      percentual_desconto,
      valor_fixo,
      data_inicio,
      data_fim,
      quantidade_total,
      quantidade_disponivel,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ATIVO')
  `;

  const params = [
    data.comercio_id,
    data.categoria_id,
    data.titulo,
    data.codigo ?? null,
    data.percentual_desconto ?? null,
    data.valor_fixo ?? null,
    data.data_inicio,
    data.data_fim,
    data.quantidade_total,
    data.quantidade_total,
  ];

  const [result] = await db.execute(sql, params);
  return result.insertId;
}

async function listarPorComercio(comercio_id) {
  const [rows] = await db.execute(
    `
    SELECT 
      c.id,
      c.titulo,
      c.codigo,
      c.data_inicio,
      c.data_fim,
      c.quantidade_total,
      c.quantidade_disponivel,
      c.status,
      cat.nome AS categoria
    FROM cupom c
    JOIN categoria cat ON cat.id = c.categoria_id
    WHERE c.comercio_id = ?
    ORDER BY c.data_inicio DESC
  `,
    [comercio_id]
  );

  return rows;
}


async function listarDisponiveis() {
  const [rows] = await db.execute(`
    SELECT 
      c.id,
      c.titulo,
      c.codigo,
      c.data_inicio,
      c.data_fim,
      c.quantidade_disponivel,
      cat.nome AS categoria
    FROM cupom c
    JOIN categoria cat ON cat.id = c.categoria_id
    WHERE c.status = 'ATIVO'
      AND c.quantidade_disponivel > 0
      AND DATE(c.data_fim) >= CURDATE()
    ORDER BY c.data_fim ASC
  `);

  return rows;
}


async function listarDisponiveisComStatus(associado_id) {
  const [rows] = await db.execute(
    `
    SELECT 
      c.id,
      c.titulo,
      c.codigo,
      c.data_inicio,
      c.data_fim,
      c.quantidade_disponivel,
      cat.nome AS categoria,
      CASE 
        WHEN ca.id IS NOT NULL THEN 1
        ELSE 0
      END AS reservado
    FROM cupom c
    JOIN categoria cat ON cat.id = c.categoria_id
    LEFT JOIN cupom_associado ca 
      ON ca.cupom_id = c.id
     AND ca.associado_id = ?
    WHERE c.status = 'ATIVO'
      AND DATE(c.data_fim) >= CURDATE()
    ORDER BY c.data_fim ASC
  `,
    [associado_id]
  );

  return rows;
}


async function buscarPorCodigo(codigo) {
  const [rows] = await db.execute(
    `
    SELECT 
      c.id,
      c.titulo,
      c.codigo,
      c.data_inicio,
      c.data_fim,
      c.status,
      c.comercio_id
    FROM cupom c
    WHERE c.codigo = ?
      AND c.status = 'ATIVO'
  `,
    [codigo]
  );

  return rows[0];
}

module.exports = {
  criarCupom,
  listarPorComercio,
  listarDisponiveis,
  listarDisponiveisComStatus,
  buscarPorCodigo,
};
