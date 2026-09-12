import { supabaseAdmin } from '../../lib/supabase.js';
import { verificarSessao } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const sessao = verificarSessao(req);
  if (!sessao) return res.status(401).json({ erro: 'Não autenticado' });

  const { id } = req.query;

  const { data: item, error: erroBusca } = await supabaseAdmin
    .from('gallery_items')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (erroBusca || !item) {
    return res.status(404).json({ erro: 'Item não encontrado' });
  }

  const { error: erroStorage } = await supabaseAdmin.storage
    .from('galeria')
    .remove([item.storage_path]);

  // Não interrompe a exclusão do registro por causa disso — só registra
  // no log da function para investigar depois um eventual arquivo órfão
  // no Storage (o mais importante, remover da galeria, ainda funciona).
  if (erroStorage) {
    console.error('Falha ao remover arquivo do Storage:', erroStorage.message);
  }

  const { error } = await supabaseAdmin
    .from('gallery_items')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ erro: 'Erro ao remover item' });
  return res.status(200).json({ ok: true });
}
