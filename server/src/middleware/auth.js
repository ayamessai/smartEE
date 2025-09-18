import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_local_secret_change_me';

// 🔹 Middleware d'authentification
export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : req.cookies?.token;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const payload = jwt.verify(token, JWT_SECRET);

    // ✅ Always string for consistency
    req.user = { id: String(payload.id), role: payload.role };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

// 🔹 Alias pour compatibilité
export const authMiddleware = requireAuth;

// 🔹 Vérification du rôle
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}
