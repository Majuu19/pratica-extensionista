const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return res.status(401).json({ status: 'error', message: 'Token ausente' });

  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer')
    return res.status(401).json({ status: 'error', message: 'Formato de token inválido' });

  const token = parts[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, tipo: payload.tipo };
    return next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Token inválido ou expirado' });
  }
}

module.exports = { verifyToken };
