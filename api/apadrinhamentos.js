import {supabaseAdmin} from '../lib/supabase.js';
import {verificarSessao} from '../lib/auth.js';
import {protegerMutacao,auditar} from '../lib/security.js';
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST','PATCH'].includes(req.method))return res.status(405).json({erro:'Método não permitido'});
 if(req.method!=='GET'&&!protegerMutacao(req,res))return;
 try{
 const s=await verificarSessao(req);
 if(!s)return res.status(401).json({erro:'Não autenticado'});
 if(req.method==='GET'){
 const pagina=req.query?.pagina??'0';
 if(typeof pagina!=='string'||!/^\d{1,4}$/.test(pagina))return res.status(400).json({erro:'Página inválida'});
 const offset=Number(pagina)*100;
 const {data,error,count}=await supabaseAdmin.from('apadrinhamentos').select('id,referencia,inicio,encerramento',{count:'exact'}).order('inicio',{ascending:false}).order('id').range(offset,offset+99);
 if(error)throw error;
 return res.status(200).json({apadrinhamentos:data,total:count,pagina:Number(pagina)});
 }
 if(req.method==='PATCH'){
 const {id,encerramento,motivo}=req.body||{};
 if(!uuid(id)||!date(encerramento)||typeof motivo!=='string'||!motivo.trim()||motivo.trim().length>300)return res.status(400).json({erro:'Informe data e motivo válidos'});
 const {data,error}=await supabaseAdmin.rpc('encerrar_apadrinhamento',{p_id:id,p_data:encerramento,p_motivo:motivo.trim(),p_admin:s.adminId});
 if(error)throw error;
 if(!data)return res.status(409).json({erro:'Encerramento incompatível com o vínculo ou contribuições existentes'});
 return res.status(200).json({ok:true});
 }
 const {id,referencia,inicio}=req.body||{};
 if(!uuid(id)||typeof referencia!=='string'||!referencia.trim()||referencia.trim().length>120||!date(inicio))return res.status(400).json({erro:'Dados inválidos'});
 const {error}=await supabaseAdmin.from('apadrinhamentos').insert({id,referencia:referencia.trim(),inicio,created_by:s.adminId});
 if(error?.code==='23505')return res.status(409).json({erro:'Registro já existente'});
 if(error)throw error;
 await auditar(s.adminId,'criar','apadrinhamento',id);
 return res.status(201).json({id});
 }catch(e){console.error('Falha apadrinhamentos',e.code||'interno');return res.status(503).json({erro:'Serviço indisponível'});}
}
