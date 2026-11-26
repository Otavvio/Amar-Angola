import {supabaseAdmin} from '../lib/supabase.js';
import {verificarSessao} from '../lib/auth.js';
import {protegerMutacao} from '../lib/security.js';
export default async function handler(req,res){
res.setHeader('Cache-Control','no-store');
if(!['GET','POST'].includes(req.method))return res.status(405).json({erro:'Método não permitido'});
if(req.method==='POST'&&!protegerMutacao(req,res))return;
try{
const s=await verificarSessao(req);
if(!s)return res.status(401).json({erro:'Não autenticado'});
if(req.method==='GET'){
const ano=Number(req.query?.ano),semestre=Number(req.query?.semestre);
if(!Number.isInteger(ano)||ano<2000||ano>9999||![1,2].includes(semestre))return res.status(400).json({erro:'Período inválido'});
const {data,error}=await supabaseAdmin.from('relatorios_semestrais').select('id,ano,semestre,versao,motivo,resumo,created_at').eq('ano',ano).eq('semestre',semestre).order('versao',{ascending:false}).limit(100);
if(error)throw error;
return res.status(200).json({relatorios:data});
}
const {ano,semestre,motivo}=req.body||{};
if(!Number.isInteger(ano)||ano<2000||ano>9999||![1,2].includes(semestre)||typeof motivo!=='string'||!motivo.trim()||motivo.trim().length>300)return res.status(400).json({erro:'Dados inválidos'});
const {data,error}=await supabaseAdmin.rpc('consolidar_semestre',{p_ano:ano,p_semestre:semestre,p_motivo:motivo.trim(),p_admin:s.adminId});
if(error?.code==='22023')return res.status(400).json({erro:'Semestre ainda aberto ou dados inválidos'});
if(error)throw error;
return res.status(201).json({id:data});
}catch(e){console.error('Relatórios indisponíveis',e.code||'interno');return res.status(503).json({erro:'Relatórios indisponíveis'});}
}
