import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';

const COOKIE_NAME = 'admin_session';
const MAX_AGE_SEGUNDOS = 60 * 60 * 8; // 8 horas

export function criarCookieSessao(payload) {
  const token = jwt.sign(payload, process.env.SESSION_SECRET, {
    expiresIn: MAX_AGE_SEGUNDOS,
  });
  return serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SEGUNDOS,
  });
}

export function limparCookieSessao() {
  return serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// Retorna o payload da sessão se o cookie for válido, ou null caso
// contrário (ausente, expirado ou adulterado).
export function verificarSessao(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.SESSION_SECRET);
  } catch {
    return null;
  }
}
