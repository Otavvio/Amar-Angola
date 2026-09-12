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
  gif: 'image/gif',
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('gallery_items')
      .select('id, url, tipo, nome, created_at')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ erro: 'Erro ao buscar galeria' });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const sessao = verificarSessao(req);
    if (!sessao) return res.status(401).json({ erro: 'Não autenticado' });

    const { nome, base64 } = req.body || {};
    if (!nome || !base64) {
      return res.status(400).json({ erro: 'Dados incompletos' });
    }

    const extensao = (nome.includes('.') ? nome.split('.').pop() : 'jpg').toLowerCase();
    const contentType = CONTENT_TYPES[extensao];
    if (!contentType) {
      return res.status(400).json({ erro: 'Formato de imagem não suportado' });
    }

    const buffer = Buffer.from(base64.split(',').pop(), 'base64');
    const caminho = `${crypto.randomUUID()}.${extensao}`;

    const { error: erroUpload } = await supabaseAdmin.storage
      .from('galeria')
      .upload(caminho, buffer, { contentType });

    if (erroUpload) return res.status(500).json({ erro: 'Erro ao enviar arquivo' });

    const { data: urlData } = supabaseAdmin.storage
      .from('galeria')
      .getPublicUrl(caminho);

    const { data, error } = await supabaseAdmin
      .from('gallery_items')
      .insert({ url: urlData.publicUrl, storage_path: caminho, tipo: 'image', nome })
      .select()
      .single();

    if (error) return res.status(500).json({ erro: 'Erro ao salvar registro' });
    return res.status(201).json(data);
  }

  return res.status(405).json({ erro: 'Método não permitido' });
}
