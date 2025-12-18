const db = require("../config/db");


async function reservarCupom(cupom_id, associado_id) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    
    const [existe] = await conn.execute(
      `SELECT id
       FROM cupom_associado
       WHERE cupom_id = ? AND associado_id = ?`,
      [cupom_id, associado_id]
    );

    if (existe.length > 0) {
      throw new Error("Cupom já reservado por este associado");
    }

   
    const [update] = await conn.execute(
      `UPDATE cupom
       SET quantidade_disponivel = quantidade_disponivel - 1
       WHERE id = ?
         AND status = 'ATIVO'
         AND data_fim >= CURDATE()
         AND quantidade_disponivel > 0`,
      [cupom_id]
    );

    if (update.affectedRows === 0) {
      throw new Error("Cupom sem estoque, vencido ou inativo");
    }

    const [result] = await conn.execute(
      `INSERT INTO cupom_associado
       (cupom_id, associado_id, data_reserva)
       VALUES (?, ?, NOW())`,
      [cupom_id, associado_id]
    );

    await conn.commit();
    return result.insertId;

  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function registrarUso(cupom_id, associado_id) {
  const [result] = await db.execute(
    `UPDATE cupom_associado
     SET data_uso = NOW()
     WHERE cupom_id = ?
       AND associado_id = ?
       AND data_uso IS NULL`,
    [cupom_id, associado_id]
  );

  return result.affectedRows;
}


async function reservarERegistrarUso(cupom_id, associado_id) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

   
    const [rows] = await conn.execute(
      `SELECT id, data_uso FROM cupom_associado WHERE cupom_id = ? AND associado_id = ? FOR UPDATE`,
      [cupom_id, associado_id]
    );

    if (rows.length > 0) {
      const existente = rows[0];
      if (existente.data_uso === null) {
        
        const [up] = await conn.execute(
          `UPDATE cupom_associado SET data_uso = NOW() WHERE id = ? AND data_uso IS NULL`,
          [existente.id]
        );

        if (up.affectedRows === 0) {
          throw new Error('Cupom já utilizado');
        }

        await conn.commit();
        return { usedExisting: true };
      } else {
        
        throw new Error('Cupom já utilizado por este associado');
      }
    }

    
    const [update] = await conn.execute(
      `UPDATE cupom
       SET quantidade_disponivel = quantidade_disponivel - 1
       WHERE id = ?
         AND status = 'ATIVO'
         AND DATE(data_fim) >= CURDATE()
         AND quantidade_disponivel > 0`,
      [cupom_id]
    );

    if (update.affectedRows === 0) {
      throw new Error('Cupom sem estoque, vencido ou inativo');
    }

    
    const [result] = await conn.execute(
      `INSERT INTO cupom_associado (cupom_id, associado_id, data_reserva, data_uso)
       VALUES (?, ?, NOW(), NOW())`,
      [cupom_id, associado_id]
    );

    await conn.commit();
    return { usedExisting: false, id: result.insertId };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}


async function listarCuponsDoAssociado(associado_id) {
  const [rows] = await db.execute(`
    SELECT 
      c.id,
      c.titulo,
      cat.nome AS categoria,
      c.data_inicio,
      c.data_fim,
      ca.data_reserva,
      ca.data_uso,
      CASE
        WHEN ca.data_uso IS NOT NULL THEN 'utilizado'
        WHEN c.data_fim < CURDATE() THEN 'vencido'
        ELSE 'ativo'
      END AS status
    FROM cupom_associado ca
    JOIN cupom c ON c.id = ca.cupom_id
    JOIN categoria cat ON cat.id = c.categoria_id
    WHERE ca.associado_id = ?
    ORDER BY ca.data_reserva DESC
  `, [associado_id]);

  return rows;
}

module.exports = {
  reservarCupom,
  registrarUso,
  reservarERegistrarUso,
  listarCuponsDoAssociado
};
