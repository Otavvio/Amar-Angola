import crypto from 'crypto';
import { supabaseAdmin } from '../../lib/supabase.js';
import { verificarSessao } from '../../lib/auth.js';

// Upload vai como base64 dentro do JSON. A Vercel tem um limite fixo de
// ~4.5MB por requisição em Serverless Functions, que não pode ser
// aumentado por configuração — por isso a galeria aceita só fotos aqui.
// Vídeos precisariam de upload direto pro Storage via signed URL, o que
// está fora do escopo atual (ver README-BACKEND.md).
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

const CONTENT_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('gallery_items')
      .select('id, storage_path, tipo, created_at')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ erro: 'Erro ao buscar galeria' });
    res.setHeader('Cache-Control', 'no-store');
    const items = await Promise.all(data.map(async ({storage_path, ...item}) => {
      const {data: signed, error: signingError} = await supabaseAdmin.storage.from('galeria').createSignedUrl(storage_path, 300);
      return signingError ? null : {...item, nome: 'Foto do projeto', url: signed.signedUrl};
    }));
    return res.status(200).json(items.filter(Boolean));
  }

  if (req.method === 'POST') {
    const sessao = await verificarSessao(req);
    if (!sessao) return res.status(401).json({ erro: 'Não autenticado' });

    const { nome, base64 } = req.body || {};
    if (typeof nome !== 'string' || nome.length > 255 || typeof base64 !== 'string' || base64.length > 2800000 || !base64) {
      return res.status(400).json({ erro: 'Dados incompletos' });
    }

    const extensao = (nome.includes('.') ? nome.split('.').pop() : 'jpg').toLowerCase();
    const contentType = CONTENT_TYPES[extensao];
    if (!contentType) {
      return res.status(400).json({ erro: 'Formato de imagem não suportado' });
    }

    const buffer = Buffer.from(base64.split(',').pop(), 'base64');
    if (!buffer.length || buffer.length > 2097152) return res.status(400).json({erro: 'Imagem excede 2 MB ou está vazia'});
    const jpeg = buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
    const png = buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const webp = buffer.toString('ascii',0,4) === 'RIFF' && buffer.toString('ascii',8,12) === 'WEBP';
    if (!(contentType === 'image/jpeg' && jpeg || contentType === 'image/png' && png || contentType === 'image/webp' && webp)) return res.status(400).json({erro: 'Conteúdo incompatível com formato'});
    const caminho = `${crypto.randomUUID()}.${extensao}`;

    const { error: erroUpload } = await supabaseAdmin.storage
      .from('galeria')
      .upload(caminho, buffer, { contentType });

    if (erroUpload) return res.status(500).json({ erro: 'Erro ao enviar arquivo' });



    const { data, error } = await supabaseAdmin
      .from('gallery_items')
      .insert({ url: caminho, storage_path: caminho, tipo: 'image', nome: 'Foto do projeto' })
      .select()
      .single();

    if (error) {
      await supabaseAdmin.storage.from('galeria').remove([caminho]);
      return res.status(500).json({ erro: 'Erro ao salvar registro' });
    }
    const {data: signed} = await supabaseAdmin.storage.from('galeria').createSignedUrl(caminho, 300);
    return res.status(201).json({...data, url: signed?.signedUrl || null});
  }

  return res.status(405).json({ erro: 'Método não permitido' });
}
