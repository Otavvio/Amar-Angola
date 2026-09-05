  // Todas as chamadas usam credentials: 'include' para que o cookie
  // httpOnly de sessão seja enviado/recebido pelo navegador.

  async function abrirAdminPanel() {
    document.getElementById('adminPanelContainer').style.display = 'block';

    const resp = await fetch('/api/session', { credentials: 'include' });
    const { logado } = await resp.json();

    if (logado) {
      document.getElementById('adminLoginContainer').style.display = 'none';
      document.getElementById('adminDashboardContainer').style.display = 'block';
      adminCarregarDados();
    } else {
      document.getElementById('adminLoginContainer').style.display = 'flex';
      document.getElementById('adminDashboardContainer').style.display = 'none';
    }
  }

  function fecharAdminPanel() {
    document.getElementById('adminLoginForm').reset();
    document.getElementById('adminPanelContainer').style.display = 'none';
  }

  async function adminFazerLogin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();

    const resp = await fetch('/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (resp.ok) {
      document.getElementById('adminLoginContainer').style.display = 'none';
      document.getElementById('adminDashboardContainer').style.display = 'block';
      adminCarregarDados();
    } else {
      document.getElementById('adminErrorMsg').style.display = 'block';
      setTimeout(() => {
        document.getElementById('adminErrorMsg').style.display = 'none';
      }, 3000);
    }
  }

  async function adminFazerLogout() {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    document.getElementById('adminLoginContainer').style.display = 'flex';
    document.getElementById('adminDashboardContainer').style.display = 'none';
    document.getElementById('adminLoginForm').reset();
  }

  async function adminCarregarDados() {
    const resp = await fetch('/api/stats');
    if (!resp.ok) return;
    const { visitas, doacoes, padrinhos } = await resp.json();

    const visitasEl = document.getElementById('adminVisitasValue');
    if (visitasEl) visitasEl.textContent = parseInt(visitas || 0).toLocaleString('pt-BR');

    const doacoesValEl = document.getElementById('adminDoacoesValue');
    if (doacoesValEl) {
      doacoesValEl.textContent = 'R$ ' + parseFloat(doacoes || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    const padrinhosValEl = document.getElementById('adminPadrinhosValue');
    if (padrinhosValEl) padrinhosValEl.textContent = parseInt(padrinhos || 0);

    const doacoesInEl = document.getElementById('adminInputDoacoes');
    if (doacoesInEl) doacoesInEl.value = doacoes;

    const padrinhosInEl = document.getElementById('adminInputPadrinhos');
    if (padrinhosInEl) padrinhosInEl.value = padrinhos;

    atualizarGerenciamentoFotos();
  }

  async function adminSalvarDado(tipo, inputId) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;
    const valor = inputEl.value;

    const resp = await fetch('/api/stats', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [tipo]: valor }),
    });
    if (!resp.ok) {
      alert('Não foi possível salvar. Faça login novamente.');
      return;
    }

    if (tipo === 'doacoes') {
      const doacoesValEl = document.getElementById('adminDoacoesValue');
      if (doacoesValEl) {
        doacoesValEl.textContent = 'R$ ' + parseFloat(valor).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
    } else if (tipo === 'padrinhos') {
      const padrinhosValEl = document.getElementById('adminPadrinhosValue');
      if (padrinhosValEl) padrinhosValEl.textContent = parseInt(valor);
    }

    const msgId = 'adminSaveMsg' + tipo.charAt(0).toUpperCase() + tipo.slice(1);
    const msgEl = document.getElementById(msgId);
    if (msgEl) {
      msgEl.style.display = 'block';
      setTimeout(() => { msgEl.style.display = 'none'; }, 2000);
    }
  }

  // Carrega a galeria pública (chamado para todo visitante, não só admin)
  async function carregarGaleriaCustomizada() {
    const galeriaGrid = document.querySelector('.galeria-grid');
    if (!galeriaGrid) return;

    const resp = await fetch('/api/gallery');
    if (!resp.ok) return;
    const itens = await resp.json();

    galeriaGrid.querySelectorAll('.galeria-item.customizada').forEach(f => f.remove());

    itens.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'galeria-item customizada';
      div.style.position = 'relative';
      div.style.borderRadius = '4px';
      div.style.overflow = 'hidden';
      div.style.background = '#e0d8cc';
      div.style.height = '200px';

      if (item.tipo === 'video') {
        const video = document.createElement('video');
        video.src = item.url;
        video.style.cssText = 'width: 100%; height: 100%; object-fit: cover; cursor: pointer;';
        video.controls = true;
        div.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.nome || 'Foto galeria';
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; cursor: pointer; transition: transform 0.4s ease;';
        img.addEventListener('mouseover', function() { this.style.transform = 'scale(1.04)'; });
        img.addEventListener('mouseout', function() { this.style.transform = 'scale(1)'; });
        div.appendChild(img);
      }

      galeriaGrid.appendChild(div);
    });
  }

  // Deleta pelo ID (UUID) do item no banco, não mais por índice de array
  window.deletarFoto = async function(id) {
    if (!confirm('Remover esta foto/vídeo da galeria?')) return;

    const resp = await fetch(`/api/gallery/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!resp.ok) {
      alert('Não foi possível remover. Faça login novamente.');
      return;
    }

    atualizarGerenciamentoFotos();
    carregarGaleriaCustomizada();
  };

  async function atualizarGerenciamentoFotos() {
    const totalFotosEl = document.getElementById('adminTotalFotos');
    const galeriaListEl = document.getElementById('adminGaleriaList');
    if (!galeriaListEl) return;

    const resp = await fetch('/api/gallery');
    if (!resp.ok) return;
    const itens = await resp.json();

    if (totalFotosEl) totalFotosEl.textContent = itens.length;
    galeriaListEl.innerHTML = '';

    itens.forEach((item) => {
      const div = document.createElement('div');
      div.style.cssText = 'position: relative; border-radius: 6px; overflow: hidden; background: #f7f5f0; border: 1px solid rgba(26,26,24,0.1); aspect-ratio: 1; cursor: pointer;';

      if (item.tipo === 'video') {
        const video = document.createElement('video');
        video.src = item.url;
        video.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
        div.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.nome || 'Foto';
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
        div.appendChild(img);
      }

      const btnDelete = document.createElement('button');
      btnDelete.innerHTML = '×';
      btnDelete.type = 'button';
      btnDelete.style.cssText = 'position: absolute; top: 0; right: 0; background: rgba(255,0,0,0.8); color: white; border: none; width: 20px; height: 20px; cursor: pointer; font-size: 14px; padding: 0; z-index: 10;';
      btnDelete.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        deletarFoto(item.id);
      });

      div.appendChild(btnDelete);
      galeriaListEl.appendChild(div);
    });
  }

  // Upload de fotos/vídeos
  let adminSelectedFiles = [];
  const adminFileInput = document.getElementById('adminFileInput');
  const adminUploadArea = document.getElementById('adminUploadArea');
  const adminPreviewContainer = document.getElementById('adminPreviewContainer');
  const adminPreviewList = document.getElementById('adminPreviewList');

  if (adminFileInput) {
    adminFileInput.addEventListener('change', (e) => {
      adminSelectedFiles = Array.from(e.target.files);
      adminAtualizarPreview();
    });
  }

  if (adminUploadArea) {
    adminUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      adminUploadArea.style.background = 'rgba(200, 121, 58, 0.1)';
      adminUploadArea.style.borderColor = '#a05a20';
    });

    adminUploadArea.addEventListener('dragleave', () => {
      adminUploadArea.style.background = '';
      adminUploadArea.style.borderColor = '#c8793a';
    });

    adminUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      adminUploadArea.style.background = '';
      adminUploadArea.style.borderColor = '#c8793a';
      adminSelectedFiles = Array.from(e.dataTransfer.files).filter(f =>
        f.type.startsWith('image/') || f.type.startsWith('video/')
      );
      adminAtualizarPreview();
    });
  }

  function adminAtualizarPreview() {
    if (!adminPreviewContainer || !adminPreviewList) return;

    if (adminSelectedFiles.length === 0) {
      adminPreviewContainer.style.display = 'none';
      return;
    }

    adminPreviewContainer.style.display = 'block';
    adminPreviewList.innerHTML = '';

    adminSelectedFiles.forEach((file, index) => {
      const div = document.createElement('div');
      div.style.cssText = 'position: relative; border-radius: 6px; overflow: hidden; background: #f7f5f0; border: 1px solid rgba(26,26,24,0.1); aspect-ratio: 1;';

      const reader = new FileReader();
      reader.onload = (e) => {
        if (file.type.startsWith('image/')) {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
          div.appendChild(img);
        } else if (file.type.startsWith('video/')) {
          const video = document.createElement('video');
          video.src = e.target.result;
          video.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
          div.appendChild(video);
        }
      };
      reader.readAsDataURL(file);

      const btnRemove = document.createElement('button');
      btnRemove.type = 'button';
      btnRemove.innerHTML = '×';
      btnRemove.style.cssText = 'position: absolute; top: -1px; right: -1px; background: rgba(255,0,0,0.8); color: white; border: none; width: 24px; height: 24px; border-radius: 0 6px 0 4px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;';
      btnRemove.addEventListener('click', () => {
        adminSelectedFiles.splice(index, 1);
        adminAtualizarPreview();
      });

      div.appendChild(btnRemove);
      adminPreviewList.appendChild(div);
    });
  }

  async function adminEnviarFotosGaleria() {
    if (!adminSelectedFiles || adminSelectedFiles.length === 0) {
      alert('Selecione pelo menos uma foto ou vídeo para enviar.');
      return;
    }

    for (const file of adminSelectedFiles) {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const resp = await fetch('/api/gallery', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: file.name,
          tipo: file.type.startsWith('video/') ? 'video' : 'image',
          base64,
        }),
      });

      if (!resp.ok) {
        alert(`Falha ao enviar "${file.name}". Verifique o tamanho do arquivo e se a sessão ainda está ativa.`);
        return;
      }
    }

    alert('Fotos/vídeos adicionados à galeria com sucesso!');
    adminSelectedFiles = [];
    if (adminPreviewContainer) adminPreviewContainer.style.display = 'none';
    if (adminFileInput) adminFileInput.value = '';

    atualizarGerenciamentoFotos();
    carregarGaleriaCustomizada();
  }

  // Carrega a galeria pública para todo visitante ao abrir a página
  window.addEventListener('load', () => {
    carregarGaleriaCustomizada();
  });
