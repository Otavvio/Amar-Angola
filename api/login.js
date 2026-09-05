import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../lib/supabase.js';
import { criarCookieSessao } from '../lib/auth.js';
import { loginRatelimit } from '../lib/ratelimit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'desconhecido';

  const { success } = await loginRatelimit.limit(ip);
  if (!success) {
    return res.status(429).json({
      erro: 'Muitas tentativas de login. Aguarde um minuto e tente novamente.',
    });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ erro: 'Usuário e senha são obrigatórios' });
  }

  const { data: admin, error } = await supabaseAdmin
    .from('admins')
    .select('id, username, password_hash')
    .eq('username', username)
    .maybeSingle();

  // Mensagem genérica de propósito: não revelar se foi o usuário ou a
  // senha que estava errada.
  if (error || !admin) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const senhaOk = await bcrypt.compare(password, admin.password_hash);
  if (!senhaOk) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  res.setHeader(
    'Set-Cookie',
    criarCookieSessao({ adminId: admin.id, username: admin.username })
  );
  return res.status(200).json({ ok: true });
}
