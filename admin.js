  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'AmarAngola2024';

  function abrirAdminPanel() {
    document.getElementById('adminPanelContainer').style.display = 'block';
    document.getElementById('adminLoginContainer').style.display = 'flex';
    document.getElementById('adminDashboardContainer').style.display = 'none';
  }

  function fecharAdminPanel() {
    // Mesma lógica do logout: remove a sessão salva do Admin
    // para não ficar logado ao reabrir o painel.
    localStorage.removeItem('adminLogado');
    document.getElementById('adminLoginForm').reset();
    document.getElementById('adminPanelContainer').style.display = 'none';
  }

  function adminFazerLogin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem('adminLogado', 'true');
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

  function adminFazerLogout() {
    localStorage.removeItem('adminLogado');
    document.getElementById('adminLoginContainer').style.display = 'flex';
    document.getElementById('adminDashboardContainer').style.display = 'none';
    document.getElementById('adminLoginForm').reset();
  }

  function adminCarregarDados() {
    // Migrar fotos antigas
    migrarFotosAntiguasParaID();
    const visitas = localStorage.getItem('visitas') || '0';
    const doacoes = localStorage.getItem('doacoes') || '0';
    const padrinhos = localStorage.getItem('padrinhos') || '0';

    const visitasEl = document.getElementById('adminVisitasValue');
    if (visitasEl) visitasEl.textContent = parseInt(visitas).toLocaleString('pt-BR');
    
    const doacoesValEl = document.getElementById('adminDoacoesValue');
    if (doacoesValEl) doacoesValEl.textContent = 'R$ ' + parseFloat(doacoes).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    const padrinhosValEl = document.getElementById('adminPadrinhosValue');
    if (padrinhosValEl) padrinhosValEl.textContent = parseInt(padrinhos);

    const doacoesInEl = document.getElementById('adminInputDoacoes');
    if (doacoesInEl) doacoesInEl.value = doacoes;
    
    const padrinhosInEl = document.getElementById('adminInputPadrinhos');
    if (padrinhosInEl) padrinhosInEl.value = padrinhos;

    // Também carregar galeria
    if (typeof carregarGaleriaCustomizada === 'function') {
      carregarGaleriaCustomizada();
    }
    // Atualizar gerenciamento de fotos
    if (typeof atualizarGerenciamentoFotos === 'function') {
      atualizarGerenciamentoFotos();
    }
  }

  function adminSalvarDado(tipo, inputId) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;
    
    const valor = inputEl.value;
    localStorage.setItem(tipo, valor);
    
    if (tipo === 'doacoes') {
      const doacoesValEl = document.getElementById('adminDoacoesValue');
      if (doacoesValEl) doacoesValEl.textContent = 'R$ ' + parseFloat(valor).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    } else if (tipo === 'padrinhos') {
      const padrinhosValEl = document.getElementById('adminPadrinhosValue');
      if (padrinhosValEl) padrinhosValEl.textContent = parseInt(valor);
    }

    const msgId = 'adminSaveMsg' + tipo.charAt(0).toUpperCase() + tipo.slice(1);
    const msgEl = document.getElementById(msgId);
    if (msgEl) {
      msgEl.style.display = 'block';
      setTimeout(() => {
        msgEl.style.display = 'none';
      }, 2000);
    }
  }

  // Incrementar visitas automaticamente
  function incrementarVisitas() {
    let visitas = parseInt(localStorage.getItem('visitas') || '0');
    visitas++;
    localStorage.setItem('visitas', visitas.toString());
  }

  // Verificar se está logado ao carregar
  if (window) {
    window.addEventListener('load', () => {
    if (!localStorage.getItem('visitas')) {
      localStorage.setItem('visitas', '0');
      localStorage.setItem('doacoes', '0');
      localStorage.setItem('padrinhos', '0');
    }
    // Incrementar visita
    incrementarVisitas();
    // Carregar fotos customizadas na galeria
    if (typeof carregarGaleriaCustomizada === 'function') {
      setTimeout(() => {
        carregarGaleriaCustomizada();
      }, 500);
    }
  });
  }


  // Carregar fotos customizadas na galeria
  function carregarGaleriaCustomizada() {
    const galeriaGrid = document.querySelector('.galeria-grid');
    if (!galeriaGrid) {
      console.log('Elemento .galeria-grid não encontrado');
      return;
    }

    const galeriaFotos = JSON.parse(localStorage.getItem('galeriaFotos') || '[]');
    
    // Remover fotos customizadas anteriores (manter apenas as originais)
    const fotosCustomizadas = galeriaGrid.querySelectorAll('.galeria-item.customizada');
    fotosCustomizadas.forEach(f => f.remove());

    console.log(`Carregando ${galeriaFotos.length} fotos customizadas`);

    // Adicionar novas fotos customizadas
    galeriaFotos.forEach((foto, index) => {
      const div = document.createElement('div');
      div.className = 'galeria-item customizada';
      div.style.position = 'relative';
      div.style.borderRadius = '4px';
      div.style.overflow = 'hidden';
      div.style.background = '#e0d8cc';
      div.style.height = '200px';

      if (foto.tipo === 'video') {
        const video = document.createElement('video');
        video.src = foto.data;
        video.style.cssText = 'width: 100%; height: 100%; object-fit: cover; cursor: pointer;';
        video.controls = true;
        div.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = foto.data;
        img.alt = 'Foto galeria';
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; cursor: pointer; transition: transform 0.4s ease;';
        img.addEventListener('mouseover', function() { this.style.transform = 'scale(1.04)'; });
        img.addEventListener('mouseout', function() { this.style.transform = 'scale(1)'; });
        div.appendChild(img);
      }

      // Galeria pública: sem botão de excluir. A exclusão só é permitida
      // pelo Admin, dentro do painel administrativo (adminGaleriaList).
      galeriaGrid.appendChild(div);
    });
  }


  // Função para deletar foto pelo data-index


  // Deletar foto - Versão simplificada e testada
  window.deletarFoto = function(indice) {
    console.log('=== INICIANDO EXCLUSÃO ===');
    console.log('Índice a deletar:', indice);
    
    // Carregar fotos
    const fotosSalvas = localStorage.getItem('galeriaFotos');
    console.log('Fotos no localStorage (string):', fotosSalvas);
    
    let fotos = JSON.parse(fotosSalvas || '[]');
    console.log('Fotos parseadas:', fotos);
    console.log('Total de fotos:', fotos.length);
    console.log('Índice válido?', indice >= 0 && indice < fotos.length);
    
    if (indice < 0 || indice >= fotos.length) {
      console.error('Índice inválido!');
      alert('Erro: índice inválido');
      return;
    }
    
    // Deletar
    console.log('Deletando foto no índice:', indice);
    fotos.splice(indice, 1);
    console.log('Fotos após splice:', fotos);
    
    // Salvar
    const novaString = JSON.stringify(fotos);
    console.log('Nova string a salvar:', novaString);
    localStorage.setItem('galeriaFotos', novaString);
    console.log('Salvo no localStorage');
    
    // Verificar se salvou
    const verificacao = localStorage.getItem('galeriaFotos');
    console.log('Verificação do localStorage:', verificacao);
    
    // Atualizar UI
    console.log('Atualizando gerenciamento de fotos...');
    atualizarGerenciamentoFotos();
    
    console.log('Carregando galeria customizada...');
    if (typeof carregarGaleriaCustomizada === 'function') {
      carregarGaleriaCustomizada();
    }
    
    console.log('=== EXCLUSÃO CONCLUÍDA ===');
  };





  // Migrar fotos antigas para ter IDs
  function migrarFotosAntiguasParaID() {
    let fotos = JSON.parse(localStorage.getItem('galeriaFotos') || '[]');
    let foiAlterado = false;
    
    fotos = fotos.map(foto => {
      if (!foto.id) {
        foto.id = Date.now() + Math.random();
        foiAlterado = true;
      }
      return foto;
    });
    
    if (foiAlterado) {
      localStorage.setItem('galeriaFotos', JSON.stringify(fotos));
      console.log('Fotos migradas com sucesso!');
    }
  }

  // Atualizar gerenciamento de fotos no admin
  function atualizarGerenciamentoFotos() {
    const totalFotosEl = document.getElementById('adminTotalFotos');
    const galeriaListEl = document.getElementById('adminGaleriaList');

    if (!galeriaListEl) return;

    const galeriaFotos = JSON.parse(localStorage.getItem('galeriaFotos') || '[]');
    
    // Contar fotos originais
    const fotosOriginais = document.querySelectorAll('.galeria-grid .galeria-item:not(.customizada)').length;
    const totalFotos = fotosOriginais + galeriaFotos.length;
    
    if (totalFotosEl) totalFotosEl.textContent = totalFotos;

    galeriaListEl.innerHTML = '';

    // Adicionar fotos customizadas
    galeriaFotos.forEach((foto, index) => {
      const div = document.createElement('div');
      div.style.cssText = 'position: relative; border-radius: 6px; overflow: hidden; background: #f7f5f0; border: 1px solid rgba(26,26,24,0.1); aspectRatio: 1; cursor: pointer;';

      if (foto.tipo === 'video') {
        const video = document.createElement('video');
        video.src = foto.data;
        video.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
        div.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = foto.data;
        img.alt = foto.nome || 'Foto';
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
        div.appendChild(img);
      }

      const btnDelete = document.createElement('button');
      btnDelete.innerHTML = '×';
      btnDelete.type = 'button';
      btnDelete.setAttribute('data-indice', index);
      btnDelete.style.cssText = 'position: absolute; top: 0; right: 0; background: rgba(255,0,0,0.8); color: white; border: none; width: 20px; height: 20px; cursor: pointer; font-size: 14px; padding: 0; z-index: 10;';
      btnDelete.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        deletarFoto(index);
      });

      div.appendChild(btnDelete);
      galeriaListEl.appendChild(div);
    });

    // Adicionar fotos originais também
    const fotosOriginaisElements = document.querySelectorAll('.galeria-grid .galeria-item:not(.customizada)');
    fotosOriginaisElements.forEach((item) => {
      const div = document.createElement('div');
      div.style.cssText = 'position: relative; border-radius: 6px; overflow: hidden; background: #f7f5f0; border: 1px solid rgba(26,26,24,0.1); aspectRatio: 1; cursor: pointer; opacity: 0.7;';

      const img = item.querySelector('img');
      if (img) {
        const imgClone = img.cloneNode(true);
        imgClone.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
        div.appendChild(imgClone);
        
        // Label para indicar que é foto original
        const label = document.createElement('div');
        label.textContent = 'Original';
        label.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; font-size: 10px; padding: 2px; text-align: center;';
        div.appendChild(label);
      }

      galeriaListEl.appendChild(div);
    });
  }

  // Upload de fotos/vídeos
  let adminSelectedFiles = [];
  const adminFileInput = document.getElementById('adminFileInput');
  const adminUploadArea = document.getElementById('adminUploadArea');
  const adminPreviewContainer = document.getElementById('adminPreviewContainer');
  const adminPreviewList = document.getElementById('adminPreviewList');

  // Evitar erros se elementos não existem
  if (!adminFileInput) {
    console.log('Elementos de upload não encontrados no DOM');
  }

  if (adminFileInput) {
    adminFileInput.addEventListener('change', (e) => {
      adminSelectedFiles = Array.from(e.target.files);
      if (typeof adminAtualizarPreview === 'function') {
        adminAtualizarPreview();
      }
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
      if (typeof adminAtualizarPreview === 'function') {
        adminAtualizarPreview();
      }
    });
  }

  function adminAtualizarPreview() {
    if (!adminPreviewContainer || !adminPreviewList) return;
    
    if (adminSelectedFiles.length === 0) {
      adminPreviewContainer.style.display = 'none';
      return;
    }

    adminPreviewContainer.style.display = 'block';
    if (adminPreviewList) adminPreviewList.innerHTML = '';

    adminSelectedFiles.forEach((file, index) => {
      const div = document.createElement('div');
      div.style.cssText = 'position: relative; border-radius: 6px; overflow: hidden; background: #f7f5f0; border: 1px solid rgba(26,26,24,0.1); aspectRatio: 1;';

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
        } else {
          div.textContent = '📁';
          div.style.display = 'flex';
          div.style.alignItems = 'center';
          div.style.justifyContent = 'center';
          div.style.fontSize = '2rem';
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
      if (adminPreviewList) adminPreviewList.appendChild(div);
    });
  }

  function adminEnviarFotosGaleria() {
    if (!adminSelectedFiles || adminSelectedFiles.length === 0) {
      alert('Selecione pelo menos uma foto ou vídeo para enviar.');
      return;
    }

    // Salvar as imagens na galeria
    let galeriaSalva = JSON.parse(localStorage.getItem('galeriaFotos') || '[]');
    let processadas = 0;

    adminSelectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        galeriaSalva.push({
          id: Date.now() + Math.random(),
          data: e.target.result,
          tipo: file.type.startsWith('video/') ? 'video' : 'image',
          nome: file.name
        });
        processadas++;

        if (processadas === adminSelectedFiles.length) {
          localStorage.setItem('galeriaFotos', JSON.stringify(galeriaSalva));
          alert('Fotos/vídeos adicionados à galeria com sucesso!');
          
          // Recarregar a galeria
          if (typeof carregarGaleriaCustomizada === 'function') {
            carregarGaleriaCustomizada();
          }
          
          // Atualizar gerenciamento de fotos
          if (typeof atualizarGerenciamentoFotos === 'function') {
            atualizarGerenciamentoFotos();
          }

          adminSelectedFiles = [];
          if (adminPreviewContainer) adminPreviewContainer.style.display = 'none';
          if (adminFileInput) adminFileInput.value = '';
        }
      };
      reader.readAsDataURL(file);
    });
  }
