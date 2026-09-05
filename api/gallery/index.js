import crypto from 'crypto';
import { supabaseAdmin } from '../../lib/supabase.js';
import { verificarSessao } from '../../lib/auth.js';

// Upload vai como base64 dentro do JSON (mesmo formato que o FileReader do
// front já produzia), então precisamos de um limite de corpo maior que o
// padrão. Para arquivos de vídeo grandes, o ideal a médio prazo é trocar
// isso por upload direto pro Storage via signed URL (ver README-BACKEND.md).
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const TIPOS_VALIDOS = ['image', 'video'];

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

    const { nome, tipo, base64 } = req.body || {};
    if (!nome || !tipo || !base64) {
      return res.status(400).json({ erro: 'Dados incompletos' });
    }
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({ erro: 'Tipo inválido' });
    }

    const buffer = Buffer.from(base64.split(',').pop(), 'base64');
    const extensao = nome.includes('.')
      ? nome.split('.').pop()
      : tipo === 'video' ? 'mp4' : 'jpg';
    const caminho = `${crypto.randomUUID()}.${extensao}`;

    const { error: erroUpload } = await supabaseAdmin.storage
      .from('galeria')
      .upload(caminho, buffer, {
        contentType: tipo === 'video' ? 'video/mp4' : 'image/jpeg',
      });

    if (erroUpload) return res.status(500).json({ erro: 'Erro ao enviar arquivo' });

    const { data: urlData } = supabaseAdmin.storage
      .from('galeria')
      .getPublicUrl(caminho);

    const { data, error } = await supabaseAdmin
      .from('gallery_items')
      .insert({ url: urlData.publicUrl, storage_path: caminho, tipo, nome })
      .select()
      .single();

    if (error) return res.status(500).json({ erro: 'Erro ao salvar registro' });
    return res.status(201).json(data);
  }

  return res.status(405).json({ erro: 'Método não permitido' });
}
