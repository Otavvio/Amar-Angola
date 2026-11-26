import { protegerMutacao, auditar } from '../../lib/security.js';
import { supabaseAdmin } from '../../lib/supabase.js';
import { verificarSessao } from '../../lib/auth.js';

export default async function handler(req, res) {
  if (!['DELETE','PATCH'].includes(req.method)) {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  if (!protegerMutacao(req,res)) return;
  const sessao = await verificarSessao(req);
  if (!sessao) return res.status(401).json({ erro: 'Não autenticado' });

  const { id } = req.query;
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return res.status(400).json({erro: 'ID inválido'});

  if(req.method==='PATCH'){
    const {titulo,descricao,evento,estado,autorizacao_ref,autorizacao_confirmada}=req.body||{};
    if(typeof titulo!=='string'||!titulo.trim()||titulo.trim().length>100||typeof descricao!=='string'||descricao.length>300||typeof evento!=='string'||evento.length>100||!['privada','oculta','aprovada'].includes(estado)||typeof autorizacao_ref!=='string'||autorizacao_ref.length>100||(estado==='aprovada'&&!autorizacao_ref.trim())||(autorizacao_ref.trim()&&autorizacao_confirmada!==true))return res.status(400).json({erro:'Dados inválidos ou autorização ausente'});
    const {data,error}=await supabaseAdmin.rpc('atualizar_galeria_auditada',{p_id:id,p_admin:sessao.adminId,p_titulo:titulo,p_descricao:descricao,p_evento:evento,p_estado:estado,p_ref:autorizacao_ref,p_confirmada:autorizacao_confirmada===true});
    if(error)return res.status(error.code==='22023'?400:503).json({erro:'Falha ao atualizar com auditoria'});
    if(!data)return res.status(404).json({erro:'Foto não encontrada'});
    return res.status(200).json({ok:true});
  }
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
