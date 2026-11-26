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
    const {data,error}=await supabaseAdmin.from('gallery_items').update({titulo:titulo.trim(),descricao:descricao.trim(),evento:evento.trim(),estado,autorizacao_ref:autorizacao_ref.trim()||null,autorizacao_verificada_em:autorizacao_ref.trim()?new Date().toISOString():null,autorizacao_verificada_por:autorizacao_ref.trim()?sessao.adminId:null}).eq('id',id).select('id').maybeSingle();
    if(error)return res.status(503).json({erro:'Falha ao atualizar'});
    if(!data)return res.status(404).json({erro:'Foto não encontrada'});
    await auditar(sessao.adminId,'atualizar','galeria',id,{estado,autorizacao_confirmada:autorizacao_confirmada===true});
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
