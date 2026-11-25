import {supabaseAdmin} from '../lib/supabase.js';
import {verificarSessao} from '../lib/auth.js';
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
export default async function handler(req,res){
res.setHeader('Cache-Control','no-store');
if(req.method!=='GET')return res.status(405).json({erro:'Método não permitido'});
try{
if(!await verificarSessao(req))return res.status(401).json({erro:'Não autenticado'});
const {inicio,fim}=req.query||{};
if(!date(inicio)||!date(fim)||inicio>fim||Date.parse(fim)-Date.parse(inicio)>366*86400000)return res.status(400).json({erro:'Informe um período de até um ano'});
const totais={doacao:0n,apadrinhamento:0n,despesa:0n},meses={};
for(let m=new Date(inicio.slice(0,7)+'-01T00:00:00Z');m.toISOString().slice(0,7)<=fim.slice(0,7);m.setUTCMonth(m.getUTCMonth()+1)){meses[m.toISOString().slice(0,7)]={doacao:0n,apadrinhamento:0n,despesa:0n}}
let offset=0;
while(true){
const {data,error}=await supabaseAdmin.from('movimentacoes').select('id,tipo,valor,data').gte('data',inicio).lte('data',fim).order('id').range(offset,offset+499);
if(error)throw error;
for(const m of data){const cents=BigInt(Math.round(Number(m.valor)*100));totais[m.tipo]+=cents;const mes=m.data.slice(0,7);meses[mes]??={doacao:0n,apadrinhamento:0n,despesa:0n};meses[mes][m.tipo]+=cents}
if(data.length<500)break;
offset+=500;
if(offset>=50000)return res.status(503).json({erro:'Período muito volumoso; reduza o intervalo'});
}
const {count,error}=await supabaseAdmin.from('apadrinhamentos').select('id',{count:'exact',head:true}).lte('inicio',fim).or('encerramento.is.null,encerramento.gte.'+fim);
if(error)throw error;
const {data:stats,error:se}=await supabaseAdmin.from('stats').select('visitas').eq('id',1).single();if(se)throw se;
const money=v=>v.toString();
return res.status(200).json({inicio,fim,doacoes_centavos:money(totais.doacao),contribuicoes_centavos:money(totais.apadrinhamento),receitas_centavos:money(totais.doacao+totais.apadrinhamento),despesas_centavos:money(totais.despesa),saldo_periodo_centavos:money(totais.doacao+totais.apadrinhamento-totais.despesa),apadrinhamentos_ativos:count,visitas_acumuladas:stats.visitas,meses:Object.entries(meses).sort().map(([mes,t])=>({mes,receitas_centavos:money(t.doacao+t.apadrinhamento),despesas_centavos:money(t.despesa)}))});
}catch(e){console.error('Resumo indisponível',e.code||'interno');return res.status(503).json({erro:'Resumo indisponível'});}
}
