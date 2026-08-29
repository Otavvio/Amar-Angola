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

  // Função para enviar fotos
  function enviarFotos() {
    if (selectedFiles.length === 0) {
      alert('Selecione pelo menos uma foto ou vídeo para enviar.');
      return;
    }

    // Criar mensagem com nomes dos arquivos
    const nomes = selectedFiles.map(f => f.name).join(', ');
    const mensagem = `Olá! Gostaria de enviar as seguintes fotos/vídeos do Projeto Amar Angola:\n\n${nomes}\n\nPor favor, me retorne sobre essas imagens.`;
    
    // Codificar a mensagem para URL
    const mensagemCodificada = encodeURIComponent(mensagem);
    
    // Abrir WhatsApp com a mensagem
    const whatsappUrl = `https://wa.me/5516996244103?text=${mensagemCodificada}`;
    window.open(whatsappUrl, '_blank');

    // Mostrar confirmação e fechar modal
    setTimeout(() => {
      alert('Os nomes das fotos foram enviados para o WhatsApp. Agora compartilhe as imagens na conversa!');
      fecharModal();
      // Limpar arquivos selecionados
      selectedFiles = [];
      previewContainer.style.display = 'none';
      fileInput.value = '';
    }, 500);
  }

