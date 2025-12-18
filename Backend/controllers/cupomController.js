const db = require("../config/db");
const cupomModel = require("../models/cupomModel");

const cupomAssociadoModel = require("../models/cupomAssociadoModel");
const categoriaModel = require("../models/categoriaModel");
const associadoModel = require("../models/associadoModel");


async function listarCategorias(req, res) {
  try {
    const categorias = await categoriaModel.listarCategorias();
    return res.json({ status: "success", data: categorias });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Erro ao listar categorias",
    });
  }
}


async function criarCupom(req, res) {
  try {
    const body = req.body;

    if (req.user && req.user.tipo !== "comerciante") {
      return res.status(403).json({
        status: "error",
        message: "Apenas comerciantes podem criar cupons",
      });
    }

    const comercio_id = req.user ? req.user.id : body.comercio_id;

    if (
      !comercio_id ||
      !body.titulo ||
      !body.categoria_id ||
      !body.data_inicio ||
      !body.data_fim ||
      !body.quantidade_total
    ) {
      return res.status(400).json({
        status: "error",
        message: "Preencha todos os campos obrigatórios",
      });
    }

    const data_inicio = body.data_inicio.split("T")[0];
    const data_fim = body.data_fim.split("T")[0];

    const payload = {
      comercio_id,
      categoria_id: body.categoria_id,
      titulo: body.titulo,
      codigo: body.codigo || `CP${Date.now().toString().slice(-6)}`,
      percentual_desconto: body.percentual_desconto || null,
      valor_fixo: body.valor_fixo || null,
      data_inicio,
      data_fim,
      quantidade_total: body.quantidade_total,
      quantidade_disponivel: body.quantidade_total,
    };

    const id = await cupomModel.criarCupom(payload);

    return res.json({
      status: "success",
      message: "Cupom criado com sucesso!",
      data: { id },
    });
  } catch (error) {
    console.error("ERRO AO CRIAR CUPOM:", error);
    return res.status(500).json({
      status: "error",
      message: "Erro ao criar cupom",
    });
  }
}


async function listarDisponiveis(req, res) {
  try {
    
    if (req.user && req.user.tipo === 'comerciante') {
      const comercio_id = req.user.id;
      const cupons = await cupomModel.listarPorComercio(comercio_id);
      return res.json({ status: 'success', data: cupons });
    }

    let associado_id = null;

    if (req.user && req.user.tipo === "associado") {
      associado_id = req.user.id;
    } else if (req.query.associado_id) {
      associado_id = Number(req.query.associado_id);
    }

    if (!associado_id) {
      const cupons = await cupomModel.listarDisponiveis();
      return res.json({ status: "success", data: cupons });
    }

    const cupons = await cupomModel.listarDisponiveisComStatus(associado_id);
    return res.json({ status: "success", data: cupons });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Erro ao listar cupons",
    });
  }
}


async function reservar(req, res) {
  try {
    let { cupom_id, associado_id } = req.body;

    if (req.user) {
      if (req.user.tipo !== "associado") {
        return res.status(403).json({
          status: "error",
          message: "Apenas associados podem reservar cupons",
        });
      }
      associado_id = req.user.id;
    }

    if (!cupom_id || !associado_id) {
      return res.status(400).json({
        status: "error",
        message: "Cupom e associado são obrigatórios",
      });
    }

    const id = await cupomAssociadoModel.reservarCupom(
      Number(cupom_id),
      Number(associado_id)
    );

    return res.json({
      status: "success",
      message: "Cupom reservado com sucesso!",
      data: { id },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Erro ao reservar cupom",
    });
  }
}


async function registrarUso(req, res) {
  try {
    if (req.user && req.user.tipo !== "comerciante") {
      return res.status(403).json({
        status: "error",
        message: "Apenas comerciantes podem registrar uso",
      });
    }

    const { cpf, codigo } = req.body;

    if (!cpf || !codigo) {
      return res.status(400).json({
        status: "error",
        message: "CPF e código do cupom são obrigatórios",
      });
    }

    const associado = await associadoModel.buscarPorCPF(
      cpf.replace(/\D/g, "")
    );

    if (!associado) {
      return res.status(404).json({
        status: "error",
        message: "Associado não encontrado",
      });
    }

    const cupom = await cupomModel.buscarPorCodigo(codigo);

    if (!cupom) {
      return res.status(404).json({
        status: "error",
        message: "Cupom não encontrado",
      });
    }

    
    if (req.user && req.user.tipo === 'comerciante' && cupom.comercio_id !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'Cupom não pertence a este comerciante' });
    }

    const linhas = await cupomAssociadoModel.registrarUso(cupom.id, associado.id);

    if (linhas === 0) {
      
      try {
        await cupomAssociadoModel.reservarERegistrarUso(cupom.id, associado.id);
        return res.json({ status: "success", message: "Uso do cupom registrado com sucesso (reserva criada)." });
      } catch (err) {
        return res.status(400).json({ status: "error", message: err.message || "Cupom não reservado ou já utilizado" });
      }
    }

    return res.json({ status: "success", message: "Uso do cupom registrado com sucesso!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Erro ao registrar uso do cupom",
    });
  }
}


async function meusCupons(req, res) {
  try {
    let associado_id = null;

    if (req.user && req.user.tipo === "associado") {
      associado_id = req.user.id;
    } else if (req.params.associado_id) {
      associado_id = Number(req.params.associado_id);
    }

    if (!associado_id) {
      return res.status(400).json({
        status: "error",
        message: "Associado não informado",
      });
    }

    const cupons = await cupomAssociadoModel.listarCuponsDoAssociado(
      associado_id
    );

    return res.json({ status: "success", data: cupons });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Erro ao buscar cupons do associado",
    });
  }
}

module.exports = {
  listarCategorias,
  criarCupom,
  listarDisponiveis,
  reservar,
  registrarUso,
  meusCupons,
};

