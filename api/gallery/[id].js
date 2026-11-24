import { protegerMutacao, auditar } from '../../lib/security.js';
import { supabaseAdmin } from '../../lib/supabase.js';
import { verificarSessao } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  if (!protegerMutacao(req,res)) return;
  const sessao = await verificarSessao(req);
  if (!sessao) return res.status(401).json({ erro: 'Não autenticado' });

  const { id } = req.query;
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return res.status(400).json({erro: 'ID inválido'});

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

  if (erroStorage) return res.status(500).json({erro: 'Erro ao remover arquivo'});

  const { error } = await supabaseAdmin
    .from('gallery_items')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ erro: 'Erro ao remover item' });
  await auditar(sessao.adminId,'excluir','galeria',id);
  return res.status(200).json({ ok: true });
}
