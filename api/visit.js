import { visitRatelimit } from '../lib/ratelimit.js';
import { protegerMutacao } from '../lib/security.js';
import { serialize, parse } from 'cookie';
import { supabaseAdmin } from '../lib/supabase.js';

const COOKIE_NAME = 'visita_registrada';
// Enquanto esse cookie existir, novos pedidos de /api/visit não contam de
// novo — assim recarregar a página várias vezes não infla o número.
const JANELA_SEGUNDOS = 60 * 30; // 30 minutos

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  if (!protegerMutacao(req,res)) return;
  const cookies = parse(req.headers.cookie || '');
  if (cookies[COOKIE_NAME]) {
    return res.status(200).json({ contabilizada: false });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'desconhecido';
  try {
    const {success} = await visitRatelimit.limit(ip);
    if (!success) return res.status(200).json({contabilizada:false});
  } catch { return res.status(503).json({erro:'Contador indisponível'}); }
  const { error } = await supabaseAdmin.rpc('incrementar_visitas');
  if (error) return res.status(500).json({ erro: 'Erro ao contar visita' });

  res.setHeader(
    'Set-Cookie',
    serialize(COOKIE_NAME, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: JANELA_SEGUNDOS,
    })
  );

  return res.status(200).json({ contabilizada: true });
}
