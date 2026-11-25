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
