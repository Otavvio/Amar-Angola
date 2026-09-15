  // Registra a visita no back-end (uma vez por sessão de ~30min, controlado
  // por cookie no próprio endpoint — recarregar a página não conta de novo).
  fetch('/api/visit', { method: 'POST', credentials: 'include' }).catch(() => {});

  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

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

  const linksInternos = document.querySelectorAll('a[href^="#"]');
  if (linksInternos && linksInternos.length > 0) {
    linksInternos.forEach((link) => {
      if (!link) return;
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();

        const target = document.querySelector(href);
        if (target) {
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

  if (window) {
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#contato') {
        setTimeout(() => {
          const qrBox = document.querySelector('.qr-box');
          if (qrBox) qrBox.style.transform = 'scale(1.05)';
          setTimeout(() => {
            if (qrBox) qrBox.style.transform = 'scale(1)';
          }, 300);
        }, 100);
      }
    });
  }

  const modalAddMedia = document.getElementById('modalAddMedia');

  function fecharModal() {
    if (modalAddMedia) modalAddMedia.classList.remove('open');
  }

  if (modalAddMedia) {
    window.addEventListener('click', (e) => {
      if (e.target === modalAddMedia) {
        fecharModal();
      }
    });
  }

  function enviarFotos() {
    if (typeof selectedFiles === 'undefined' || selectedFiles.length === 0) {
      alert('Selecione pelo menos uma foto ou vídeo para enviar.');
      return;
    }

    const nomes = selectedFiles.map((f) => f.name).join(', ');
    const mensagem = `Olá! Gostaria de enviar as seguintes fotos/vídeos do Projeto Amar Angola:\n\n${nomes}\n\nPor favor, me retorne sobre essas imagens.`;
    const mensagemCodificada = encodeURIComponent(mensagem);
    const whatsappUrl = `https://wa.me/5516996244103?text=${mensagemCodificada}`;
    window.open(whatsappUrl, '_blank');

    setTimeout(() => {
      alert('Os nomes das fotos foram enviados para o WhatsApp. Agora compartilhe as imagens na conversa!');
      fecharModal();
      selectedFiles = [];
      if (typeof previewContainer !== 'undefined') previewContainer.style.display = 'none';
      if (typeof fileInput !== 'undefined') fileInput.value = '';
    }, 500);
  }

