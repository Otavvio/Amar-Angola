import { supabaseAdmin } from '../lib/supabase.js';
import { verificarSessao } from '../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method === 'GET') {
    if(!await verificarSessao(req))return res.status(401).json({erro:'Não autenticado'});
    const { data, error } = await supabaseAdmin
      .from('stats')
      .select('visitas')
      .eq('id', 1)
      .single();

    if (error) return res.status(500).json({ erro: 'Erro ao buscar estatísticas' });
    return res.status(200).json(data);
  }

  return res.status(405).json({ erro: 'Método não permitido' });
}
