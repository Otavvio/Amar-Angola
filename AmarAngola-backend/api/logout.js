import { limparCookieSessao } from '../lib/auth.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }
  res.setHeader('Set-Cookie', limparCookieSessao());
  return res.status(200).json({ ok: true });
}
