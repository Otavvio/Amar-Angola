import { supabaseAdmin } from './supabase.js';
import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';

const COOKIE_NAME = 'admin_session';
const MAX_AGE_SEGUNDOS = 60 * 60 * 8; // 8 horas

export function criarCookieSessao(payload) {
  const token = jwt.sign(payload, process.env.SESSION_SECRET, {
    expiresIn: MAX_AGE_SEGUNDOS,
    algorithm: 'HS256',
  });
  return serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE_SEGUNDOS,
  });
}

export function limparCookieSessao() {
  return serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

// Retorna o payload da sessão se o cookie for válido, ou null caso
// contrário (ausente, expirado ou adulterado).
export async function verificarSessao(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.SESSION_SECRET, { algorithms: ['HS256'] });
    if (!payload.sid || !payload.adminId) return null;
    const {data,error} = await supabaseAdmin.from('admin_sessions').select('id').eq('id',payload.sid).eq('admin_id',payload.adminId).is('revoked_at',null).gt('expires_at',new Date().toISOString()).maybeSingle();
    return !error && data ? payload : null;
  } catch {
    return null;
  }
}
