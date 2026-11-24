import { protegerMutacao, auditar } from '../lib/security.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { verificarSessao, limparCookieSessao } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }
  if (!protegerMutacao(req,res)) return;
  const sessao = await verificarSessao(req);
  if (sessao) {
    const {error} = await supabaseAdmin.from('admin_sessions').update({revoked_at:new Date().toISOString()}).eq('id',sessao.sid).eq('admin_id',sessao.adminId);
    if (error) return res.status(503).json({erro:'Não foi possível encerrar sessão'});
    await auditar(sessao.adminId,'logout','sessao',sessao.sid);
  }
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Set-Cookie', limparCookieSessao());
  return res.status(200).json({ ok: true });
}
