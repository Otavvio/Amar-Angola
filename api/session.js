import { verificarSessao } from '../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'GET') return res.status(405).json({erro:'Método não permitido'});
  const sessao = await verificarSessao(req);
  return res.status(200).json({ logado: !!sessao });
}
