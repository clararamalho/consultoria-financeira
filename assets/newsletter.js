(function() {
  const REPO_RAW = 'https://cdn.jsdelivr.net/gh/clararamalho/consultoria-financeira@main';
  const NEWSLETTER_WORKER_URL = 'https://newsletter-cadastro.m-clarard.workers.dev';
  let todosPosts = [];
  let searchIndex = {};

  function formatarData(d) {
    if (!d) return '';
    const [ano, mes, dia] = d.split('-');
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    return `${parseInt(dia)} ${meses[parseInt(mes)-1]} ${ano}`;
  }

  async function carregarPosts() {
    const caminhos = [
      'posts/index.json',
      './posts/index.json',
      '/posts/index.json',
      `${REPO_RAW}/posts/index.json`
    ];

    let res;
    for (const path of caminhos) {
      try {
        res = await fetch(path);
        if (res.ok) break;
      } catch (e) {
        console.warn(`Falha ao tentar: ${path}`);
      }
    }

    try {
      if (!res || !res.ok) throw new Error('Falha ao baixar index.json');
      todosPosts = await res.json();
      construirFiltros();
      renderizarPosts(todosPosts);
      carregarSearchIndex();
    } catch (err) {
      console.error("Erro Newsletter:", err);
      const el = document.getElementById('postsLoading');
      if (el) el.textContent = 'Não foi possível carregar os posts no momento.';
    }
  }

  async function carregarSearchIndex() {
    const caminhos = [
      'posts/search-index.json',
      './posts/search-index.json',
      '/posts/search-index.json',
      `${REPO_RAW}/posts/search-index.json`
    ];

    for (const path of caminhos) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          const dados = await res.json();
          dados.forEach(item => { searchIndex[item.slug] = item.conteudo; });
          return;
        }
      } catch (e) { }
    }
  }

  function construirFiltros() {
    const container = document.getElementById('filtrosContainer');
    if (!container) return;

    const nomes = {
      educacao: 'Educação Financeira',
      investimentos: 'Investimentos',
      planejamento: 'Planejamento Financeiro',
      tributacao: 'Tributação',
      'dados-mercado': 'Dados & Mercado'
    };

    const categorias = [...new Set(todosPosts.map(p => p.categoria_id))].filter(Boolean);
    
    const todosBtn = container.querySelector('.filtro-btn');
    if (todosBtn) {
      todosBtn.onclick = () => filtrar('todos', todosBtn);
    }

    categorias.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filtro-btn';
      btn.textContent = nomes[cat] || cat;
      btn.onclick = () => filtrar(cat, btn);
      container.appendChild(btn);
    });
  }

  function renderizarPosts(posts) {
    const loading = document.getElementById('postsLoading');
    const empty = document.getElementById('buscaVazia');
    const dest = document.getElementById('postsDestaque');
    const grid = document.getElementById('postsGrid');

    if (loading) loading.style.display = 'none';
    if (empty) empty.style.display = 'none';

    if (!posts || posts.length === 0) {
      if (dest) dest.innerHTML = '<div class="posts-vazio">Nenhum post encontrado.</div>';
      if (grid) { grid.style.display = 'none'; grid.innerHTML = ''; }
      return;
    }

    const p0 = posts[0];
    if (dest) {
      dest.innerHTML = `
        <a href="post.html?slug=${p0.slug}" class="post-destaque">
          <div class="post-destaque-body">
            <div>
              <span class="post-cat">${p0.categoria || ''}</span>
              <h2>${p0.titulo}</h2>
              <p>${p0.resumo || ''}</p>
            </div>
            <span class="post-link">Ler mais</span>
          </div>
          <div class="post-destaque-img">
            <div class="post-destaque-img-inner">
              <svg viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="4"/><line x1="8" y1="24" x2="56" y2="24"/><line x1="20" y1="8" x2="20" y2="24"/><line x1="44" y1="8" x2="44" y2="24"/></svg>
            </div>
          </div>
        </a>`;
    }

    const restantes = posts.slice(1);
    if (grid) {
      if (restantes.length === 0) {
        grid.style.display = 'none';
        grid.innerHTML = '';
      } else {
        grid.style.display = 'grid';
        grid.innerHTML = restantes.map(p => `
          <a href="post.html?slug=${p.slug}" class="post-card">
            <div class="post-card-body">
              <div>
                <span class="post-cat">${p.categoria || ''}</span>
                <h2>${p.titulo}</h2>
                <p>${p.resumo || ''}</p>
              </div>
              <div class="post-card-footer">
                <span class="post-link">Ler mais</span>
                <span class="post-data">${formatarData(p.data)}</span>
              </div>
            </div>
          </a>`).join('');
      }
    }
  }

  function filtrar(cat, btn) {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
    if (btn) btn.classList.add('ativo');
    const input = document.getElementById('buscaInput');
    if (input) input.value = '';
    const filtrados = (cat === 'todos') ? todosPosts : todosPosts.filter(p => p.categoria_id === cat);
    renderizarPosts(filtrados);
  }

  function buscar(termo) {
    const t = termo.trim().toLowerCase();
    if (!t) {
      renderizarPosts(todosPosts);
      return;
    }

    const filtrados = todosPosts.filter(p => {
      const matchMeta = p.titulo.toLowerCase().includes(t) || 
                        (p.resumo || '').toLowerCase().includes(t) ||
                        (p.categoria || '').toLowerCase().includes(t);
      const matchContent = searchIndex[p.slug] && searchIndex[p.slug].toLowerCase().includes(t);
      return matchMeta || matchContent;
    });

    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
    const dest = document.getElementById('postsDestaque');
    const grid = document.getElementById('postsGrid');
    const empty = document.getElementById('buscaVazia');

    if (filtrados.length === 0) {
      if (dest) dest.innerHTML = '';
      if (grid) grid.style.display = 'none';
      if (empty) {
        empty.style.display = 'block';
        const termSpan = document.getElementById('buscaTermo');
        if (termSpan) termSpan.textContent = termo;
      }
    } else {
      if (empty) empty.style.display = 'none';
      renderizarPosts(filtrados);
    }
  }

  const buscaInput = document.getElementById('buscaInput');
  if (buscaInput) {
    buscaInput.addEventListener('input', e => buscar(e.target.value));
  }

  window.cadastrarBlog = async function() {
    const input = document.getElementById('nl-email-blog');
    const btn = document.querySelector('.nl-form button');
    if (!input || !input.value.trim()) { alert('Informe seu e-mail.'); return; }
    
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      const res = await fetch(`${NEWSLETTER_WORKER_URL}/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.value.trim(), nome: '' })
      });
      const data = await res.json();
      if (data.ok) {
        document.getElementById('nlForm').style.display = 'none';
        document.getElementById('nlSucesso').style.display = 'block';
      } else {
        alert(data.error || 'Erro ao cadastrar.');
        btn.disabled = false;
        btn.textContent = 'Quero receber';
      }
    } catch (e) {
      alert('Erro de conexão.');
      btn.disabled = false;
      btn.textContent = 'Quero receber';
    }
  };

  const topBtn = document.getElementById('top-btn');
  if (topBtn) {
    window.addEventListener('scroll', () => {
      topBtn.classList.toggle('on', window.scrollY > 400);
    }, { passive: true });
    topBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', carregarPosts);
  } else {
    carregarPosts();
  }
})();
