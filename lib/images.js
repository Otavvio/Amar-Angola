import sharp from 'sharp';

export const MAX_BYTES = 2 * 1024 * 1024;
const formats = {jpeg:'jpeg',jpg:'jpeg',png:'png',webp:'webp'};

export async function tratarImagem(base64, nome) {
  if (typeof base64 !== 'string' || base64.length > 2796300 || typeof nome !== 'string' || nome.length > 255) throw new Error('Imagem inválida');
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(base64);
  if (!match || match[2].length % 4 !== 0) throw new Error('Base64 inválido');
  const buffer = Buffer.from(match[2],'base64');
  if (!buffer.length || buffer.length > MAX_BYTES || buffer.toString('base64') !== match[2]) throw new Error('Imagem inválida ou maior que 2 MiB');
  const expected = formats[nome.split('.').pop().toLowerCase()];
  if (!expected || expected !== match[1]) throw new Error('Formato incompatível');
  const image = sharp(buffer,{limitInputPixels:16000000,failOn:'warning',animated:false});
  const meta = await image.metadata();
  if (meta.format !== expected || (meta.pages || 1) !== 1 || !meta.width || !meta.height || meta.width * meta.height > 16000000) throw new Error('Formato ou resolução inválidos');
  // Sharp remove metadados por padrão; rotate aplica a orientação antes da remoção.
  const output = await image.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:80}).toBuffer();
  if (output.length > MAX_BYTES) throw new Error('Imagem processada excede o limite');
  return output;
}
