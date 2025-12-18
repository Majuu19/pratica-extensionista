const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.post("/login", authController.login);


router.post("/associado/cadastrar", authController.cadastrarAssociado);
router.post("/comercio/cadastrar", authController.cadastrarComercio);

router.post('/cadastro', async (req, res) => {
  const tipo = req.body.tipo_usuario;

  if (!tipo) return res.status(400).json({ status: 'error', message: 'tipo_usuario é obrigatório' });

  try {
    if (tipo === 'associado') {
      
      const payload = {
        nome: req.body.nome,
        cpf: req.body.cpf,
        email: req.body.email,
        senha: req.body.senha
      };
      return authController.cadastrarAssociado({ body: payload }, res);
    }

    if (tipo === 'comerciante') {
      const payload = {
        razao_social: req.body.razao_social || req.body.nome,
        nome_fantasia: req.body.nome_fantasia || req.body.nome,
        cnpj: req.body.cnpj,
        email: req.body.email,
        senha: req.body.senha,
        categoria_id: req.body.categoria_id
      };
      return authController.cadastrarComercio({ body: payload }, res);
    }

    return res.status(400).json({ status: 'error', message: 'tipo_usuario inválido' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Erro no cadastro' });
  }
});



router.post("/forgot-password", async (req, res) => {
  const { documento } = req.body;

  if (!documento) {
    return res.status(400).json({ status: 'error', message: "Documento não informado" });
  }

  console.log("Solicitação de reset para:", documento);

  

  return res.json({ status: 'success', message: "Se o usuário existir, enviaremos instruções por e-mail" });
});

module.exports = router;
