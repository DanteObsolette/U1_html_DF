const { fail } = require('../utils/api-response');
const { verifyAccessToken } = require('../utils/jwt');
const userService = require('../services/user.service');

async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return fail(res, 'No autorizado. Debe enviar un token Bearer.', 401);
    }

    const decoded = verifyAccessToken(token);
    const user = await userService.getUserById(decoded.sub);
    req.auth = decoded;
    req.user = user;
    next();
  } catch (error) {
    return fail(res, 'Token inválido o expirado.', 401);
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return fail(res, 'No tiene permisos para realizar esta acción.', 403);
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
