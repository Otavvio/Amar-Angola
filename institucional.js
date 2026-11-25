const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');

if (toggle && links) {
  toggle.setAttribute('aria-controls', links.id);
  function setOpen(open) {
    links.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  setOpen(false);
  toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  links.addEventListener('click', event => {
    if (event.target.closest('a')) {
      if (links.classList.contains('open')) toggle.focus();
      setOpen(false);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && links.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

// Contagem aproximada, limitada por cookie e rate limit no servidor.
fetch('/api/visit',{method:'POST',credentials:'same-origin',cache:'no-store'}).catch(()=>{});

(()=>{const $=id=>document.getElementById(id);if(!$('galeriaPublica'))return;const fotos=[];let pagina=0;const filtro=$('eventoFiltro'),dialog=$('galeriaDialog'),mais=$('galeriaMais');let foco=null;function render(){const grid=$('galeriaFotos');grid.replaceChildren();for(const f of fotos.filter(f=>!filtro.value||f.evento===filtro.value)){const a=document.createElement('article'),b=document.createElement('button'),img=document.createElement('img'),h=document.createElement('h3'),p=document.createElement('p');b.type='button';img.src=f.url;img.alt=f.titulo;img.loading='lazy';b.append(img);b.addEventListener('click',()=>{foco=b;$('galeriaTitulo').textContent=f.titulo;$('galeriaAmpliada').src=f.url;$('galeriaAmpliada').alt=f.titulo;$('galeriaDescricao').textContent=f.descricao;dialog.showModal()});h.textContent=f.titulo;p.textContent=f.descricao;a.append(b,h,p);grid.append(a)}}async function carregar(){mais.disabled=true;try{const r=await fetch('/api/gallery?pagina='+pagina,{cache:'no-store'});if(!r.ok)throw new Error();const d=await r.json();fotos.push(...d.items);pagina++;const anterior=filtro.value;filtro.replaceChildren(new Option('Todos os eventos',''));for(const e of [...new Set(fotos.map(f=>f.evento).filter(Boolean))].sort())filtro.add(new Option(e,e));filtro.value=anterior;render();$('galeriaPublica').hidden=false;$('galeriaStatus').textContent=fotos.length?'Registros das ações do projeto.':'Nenhuma fotografia disponível no momento.';mais.hidden=!d.mais}catch{$('galeriaStatus').textContent='Galeria temporariamente indisponível.'}finally{mais.disabled=false}}filtro.addEventListener('change',render);mais.addEventListener('click',carregar);$('galeriaFechar').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{$('galeriaAmpliada').removeAttribute('src');foco?.focus()});carregar()})();
