import { supabaseAdmin } from '../lib/supabase.js';
import { verificarSessao } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('stats')
      .select('visitas, doacoes, padrinhos')
      .eq('id', 1)
      .single();

    if (error) return res.status(500).json({ erro: 'Erro ao buscar estatísticas' });
    return res.status(200).json(data);
  }

  if (req.method === 'PATCH') {
    const sessao = verificarSessao(req);
    if (!sessao) return res.status(401).json({ erro: 'Não autenticado' });

    const { doacoes, padrinhos } = req.body || {};
    const campos = { updated_at: new Date().toISOString() };

    if (doacoes !== undefined) {
      const valor = Number(doacoes);
      if (!Number.isFinite(valor) || valor < 0) {
        return res.status(400).json({ erro: 'Doações deve ser um número válido e não negativo' });
      }
      campos.doacoes = valor;
    }

    if (padrinhos !== undefined) {
      const valor = Number(padrinhos);
      if (!Number.isInteger(valor) || valor < 0) {
        return res.status(400).json({ erro: 'Padrinhos deve ser um número inteiro válido e não negativo' });
      }
      campos.padrinhos = valor;
    }

    const { data, error } = await supabaseAdmin
      .from('stats')
      .update(campos)
      .eq('id', 1)
      .select()
      .single();

    if (error) return res.status(500).json({ erro: 'Erro ao salvar estatísticas' });
    return res.status(200).json(data);
  }

  return res.status(405).json({ erro: 'Método não permitido' });
}
