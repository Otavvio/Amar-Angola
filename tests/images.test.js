import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { tratarImagem, MAX_BYTES } from '../lib/images.js';

const uri=(format,buffer)=>'data:image/'+format+';base64,'+buffer.toString('base64');
const source=()=>sharp({create:{width:2000,height:1000,channels:3,background:'#abcdef'}});
for(const format of ['jpeg','png','webp']){
  test('Aceita '+format+' e converte para WebP limitado a 1600 px',async()=>{
    const input=await source().toFormat(format).toBuffer();
    const out=await tratarImagem(uri(format,input),'teste.'+format);
    const m=await sharp(out).metadata();
    assert.equal(m.format,'webp');
    assert.equal(m.width,1600);
    assert.equal(m.height,800);
    assert.ok(out.length<=MAX_BYTES);
  });
}
test('Remove EXIF e GPS',async()=>{
  const input=await source().jpeg().withExif({IFD0:{Artist:'Teste ficticio'},IFD3:{GPSLatitudeRef:'N',GPSLatitude:'1/1 2/1 3/1',GPSLongitudeRef:'E',GPSLongitude:'4/1 5/1 6/1'}}).toBuffer();
  assert.ok((await sharp(input).metadata()).exif);
  const out=await tratarImagem(uri('jpeg',input),'teste.jpg');
  const m=await sharp(out).metadata();
  assert.equal(m.exif,undefined);
  assert.equal(m.xmp,undefined);
});
test('Rejeita formato declarado incompatível',async()=>{
  const input=await source().png().toBuffer();
  await assert.rejects(()=>tratarImagem(uri('png',input),'teste.jpg'));
  await assert.rejects(()=>tratarImagem(uri('jpeg',input),'teste.jpg'));
});
test('Rejeita conteúdo inválido e SVG',async()=>{
  await assert.rejects(()=>tratarImagem(uri('jpeg',Buffer.from('texto')),'teste.jpg'));
  await assert.rejects(()=>tratarImagem(uri('svg+xml',Buffer.from('<svg/>')),'teste.svg'));
  await assert.rejects(()=>tratarImagem('data:image/jpeg;base64,!!!','teste.jpg'));
});
test('Rejeita payload superior a 2 MiB',async()=>{
  await assert.rejects(()=>tratarImagem(uri('jpeg',Buffer.alloc(MAX_BYTES+1)),'teste.jpg'));
});
test('Rejeita resolução superior a 16 megapixels',async()=>{
  const input=await sharp({create:{width:4001,height:4000,channels:3,background:'#abcdef'}}).png().toBuffer();
  await assert.rejects(()=>tratarImagem(uri('png',input),'teste.png'));
});
