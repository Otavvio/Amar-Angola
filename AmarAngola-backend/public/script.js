  // Registra a visita no back-end (uma vez por sessão de ~30min, controlado
  // por cookie no próprio endpoint — recarregar a página não conta de novo).
  fetch('/api/visit', { method: 'POST', credentials: 'include' }).catch(() => {});

  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });
  }

  function fecharMenu() {
    if (toggle) toggle.classList.remove('open');
    if (links) links.classList.remove('open');
  }

  // Scroll suave até elementos com ID
  const linksInternos = document.querySelectorAll('a[href^="#"]');
  if (linksInternos && linksInternos.length > 0) {
    linksInternos.forEach(link => {
      if (!link) return;
      link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault(); // Prevenir comportamento padrão SEMPRE
      
      const target = document.querySelector(href);
      if (target) {
        // Scroll com offset para a navbar fixa
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        fecharMenu();
      }
    });
    });
  }

  // Focus especial no QR code quando acessa #contato
  if (window) {
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#contato') {
        setTimeout(() => {
          const qrBox = document.querySelector('.qr-box');
        if (qrBox) qrBox.style.transform = 'scale(1.05)';
        setTimeout(() => {
          qrBox.style.transform = 'scale(1)';
        }, 300);
      }, 100);
    }
  });
  }

  // Modal de adicionar fotos
  const modalAddMedia = document.getElementById('modalAddMedia');

  function fecharModal() {
    modalAddMedia.classList.remove('open');
  }

  // Scroll suave até elementos com ID do conteúdo
  if (modalAddMedia) {
    window.addEventListener('click', (e) => {
      if (e.target === modalAddMedia) {
      fecharModal();
      }
    });
  }

