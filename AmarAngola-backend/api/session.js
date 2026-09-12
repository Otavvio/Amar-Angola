import { verificarSessao } from '../lib/auth.js';

export default function handler(req, res) {
  const sessao = verificarSessao(req);
  return res.status(200).json({ logado: !!sessao });
}
