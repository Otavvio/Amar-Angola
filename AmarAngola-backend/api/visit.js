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

  const cookies = parse(req.headers.cookie || '');
  if (cookies[COOKIE_NAME]) {
    return res.status(200).json({ contabilizada: false });
  }

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
