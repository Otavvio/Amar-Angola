import { supabaseAdmin } from './supabase.js';

export function protegerMutacao(req,res) {
  res.setHeader('Cache-Control','no-store');
  const origin = req.headers.origin;
  const host = req.headers.host;
  const protocol = process.env.NODE_ENV === 'production' ? 'https:' : 'http:';
  if (typeof origin !== 'string' || typeof host !== 'string' || origin !== protocol + '//' + host || req.headers['sec-fetch-site'] === 'cross-site') {
    res.status(403).json({erro:'Origem não autorizada'});
    return false;
  }
  return true;
}

export async function auditar(adminId,acao,recurso,recursoId,detalhes={}) {
  try {
    const {error} = await supabaseAdmin.from('audit_logs').insert({admin_id:adminId,acao,recurso,recurso_id:recursoId,detalhes});
    if (error) console.error('Falha de auditoria',error.code);
  } catch { console.error('Auditoria indisponível'); }
}
