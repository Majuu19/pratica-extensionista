function requireRole(expectedTipo) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ status: 'error', message: 'Não autenticado' });
    if (req.user.tipo !== expectedTipo)
      return res.status(403).json({ status: 'error', message: 'Acesso negado para este tipo de usuário' });
    next();
  };
}

module.exports = requireRole;
