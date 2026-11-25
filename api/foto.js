import {supabaseAdmin} from '../lib/supabase.js';
export default async function handler(req,res){
res.setHeader('Cache-Control','private, no-store');
if(req.method!=='GET')return res.status(405).end();
if(process.env.GALLERY_ENABLED!=='true')return res.status(404).end();
const id=req.query?.id;
if(typeof id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return res.status(400).end();
try{
const {data,error}=await supabaseAdmin.from('gallery_items').select('storage_path').eq('id',id).eq('estado','aprovada').eq('tipo','image').not('autorizacao_ref','is',null).not('autorizacao_verificada_em','is',null).not('autorizacao_verificada_por','is',null).maybeSingle();
if(error)return res.status(503).end();
if(!data||!/^[-a-f0-9]{36}\.webp$/i.test(data.storage_path))return res.status(404).end();
const {data:blob,error:downloadError}=await supabaseAdmin.storage.from('galeria').download(data.storage_path);
if(downloadError||!blob||blob.size>3000000)return res.status(404).end();
res.setHeader('Content-Type','image/webp');
res.setHeader('X-Content-Type-Options','nosniff');
return res.status(200).send(Buffer.from(await blob.arrayBuffer()));
}catch{return res.status(503).end()}
}
