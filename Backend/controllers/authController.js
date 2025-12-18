const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const associadoModel = require("../models/associadoModel");
const comercioModel = require("../models/comercioModel");

function gerarToken(id, tipo) {
  return jwt.sign({ id, tipo }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
}

async function login(req, res) {
  try {
   
    const rawIdentificador = req.body.identificador || req.body.documento;
    const senha = req.body.senha;

    if (!rawIdentificador || !senha) {
      return res.status(400).json({ status: 'error', message: "Preencha CPF/CNPJ e senha." });
    }

    const identificador = String(rawIdentificador).replace(/\D/g, '');

    let usuario;
    let tipo;

    if (identificador.length === 11) {
      usuario = await associadoModel.buscarPorCPF(identificador);
      tipo = "associado";
    } else if (identificador.length === 14) {
      usuario = await comercioModel.buscarPorCNPJ(identificador);
      tipo = "comerciante";
    } else {
      return res.status(400).json({ status: 'error', message: "CPF ou CNPJ inválido." });
    }

    if (!usuario) {
      return res.status(404).json({ status: 'error', message: "Usuário não encontrado." });
    }

   
    const senhaHash = usuario.senha_hash || usuario.senha;
    if (!senhaHash) {
      return res.status(500).json({ status: 'error', message: "Erro interno: senha não encontrada no usuário." });
    }

    const senhaOk = await bcrypt.compare(senha, senhaHash);
    if (!senhaOk) {
      return res.status(401).json({ status: 'error', message: "Senha incorreta." });
    }

    const token = gerarToken(usuario.id, tipo);

    return res.json({ status: 'success', message: "Login realizado com sucesso!", data: { token, tipo, id: usuario.id } });
  } catch (error) {
    console.error("ERRO LOGIN:", error);
    return res.status(500).json({ status: 'error', message: "Erro interno no login." });
  }
}


async function cadastrarAssociado(req, res) {
  try {
    const { nome, cpf, email, senha } = req.body;

    if (!nome || !cpf || !email || !senha) {
      return res.status(400).json({ status: 'error', message: "Dados incompletos." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const id = await associadoModel.criarAssociado({
  nome,
  cpf,
  email,
  senhaHash,
});


    return res.json({ status: 'success', message: "Associado criado com sucesso!", data: { id } });
  } catch (error) {
    console.error("ERRO CADASTRO ASSOCIADO:", error);
    return res.status(500).json({ status: 'error', message: "Erro ao cadastrar associado." });
  }
}

async function cadastrarComercio(req, res) {
  try {
    const {
      razao_social,
      nome_fantasia,
      cnpj,
      email,
      senha,
      categoria_id,
    } = req.body;

    if (!razao_social || !cnpj || !email || !senha) {
      return res.status(400).json({ status: 'error', message: "Dados incompletos." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

   const id = await comercioModel.criarComercio({
  razao_social,
  nome_fantasia,
  cnpj,
  email,
  senhaHash,
  categoria_id,
});

    return res.json({ status: 'success', message: "Comerciante criado com sucesso!", data: { id } });
  } catch (error) {
    console.error("ERRO CADASTRO COMERCIO:", error);
    return res.status(500).json({ status: 'error', message: "Erro ao cadastrar comerciante." });
  }
}

module.exports = {
  login,
  cadastrarAssociado,
  cadastrarComercio,
};
