import { supabaseAdmin } from '../lib/supabase.js';
import { verificarSessao } from '../lib/auth.js';
import { protegerMutacao, auditar } from '../lib/security.js';
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
const str=(v,n)=>typeof v==='string'&&v.trim().length>0&&v.trim().length<=n;
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({erro:'Método não permitido'});
 if(req.method==='POST'&&!protegerMutacao(req,res))return;
 try{
 const sessao=await verificarSessao(req);
 if(!sessao)return res.status(401).json({erro:'Não autenticado'});
 if(req.method==='GET'){
 const {inicio,fim,pagina='0'}=req.query||{};
 if(!date(inicio)||!date(fim)||inicio>fim||typeof pagina!=='string'||!/^\d{1,4}$/.test(pagina))return res.status(400).json({erro:'Período ou página inválidos'});
 const offset=Number(pagina)*100;
 const {data,error,count}=await supabaseAdmin.from('movimentacoes').select('id,tipo,valor,data,descricao,apadrinhamento_id',{count:'exact'}).gte('data',inicio).lte('data',fim).order('data',{ascending:false}).order('id').range(offset,offset+99);
 if(error)throw error;
 return res.status(200).json({movimentacoes:data,total:count,pagina:Number(pagina)});
 }
 const {tipo,valor,data,descricao,apadrinhamento_id,id}=req.body||{};
 if(!uuid(id)||!['doacao','apadrinhamento','despesa'].includes(tipo)||typeof valor!=='number'||!Number.isFinite(valor)||valor<=0||valor>9999999999.99||Math.abs(valor*100-Math.round(valor*100))>0.001||!date(data)||!str(descricao,300)||(tipo==='apadrinhamento'?!uuid(apadrinhamento_id):apadrinhamento_id!=null))return res.status(400).json({erro:'Dados inválidos'});
 if(tipo==='apadrinhamento'){
 const {data:p,error}=await supabaseAdmin.from('apadrinhamentos').select('inicio,encerramento').eq('id',apadrinhamento_id).maybeSingle();
 if(error)throw error;
 if(!p||data<p.inicio||(p.encerramento&&data>p.encerramento))return res.status(400).json({erro:'Apadrinhamento inválido para a data'});
 }
 const {error}=await supabaseAdmin.from('movimentacoes').insert({id,tipo,valor,data,descricao:descricao.trim(),apadrinhamento_id:apadrinhamento_id||null,created_by:sessao.adminId});
 if(error?.code==='23505')return res.status(409).json({erro:'Registro já existente'});
 if(error)throw error;
 await auditar(sessao.adminId,'criar','movimentacao',id,{tipo});
 return res.status(201).json({id});
 }catch(e){console.error('Falha financeira',e.code||'interno');return res.status(503).json({erro:'Serviço financeiro indisponível'});}
}
