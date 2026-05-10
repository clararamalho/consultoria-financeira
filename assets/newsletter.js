(function() {
  const REPO_RAW = 'https://cdn.jsdelivr.net/gh/clararamalho/consultoria-financeira@main';
  const NEWSLETTER_WORKER_URL = 'https://newsletter-cadastro.m-clarard.workers.dev';
  let todosPosts = [];
  let searchIndex = {};

  async function carregarPosts() {
    try {
      // Tentar CDN primeiro (evita problemas de 404 local)
      let res = await fetch(`${REPO_RAW}/posts/index.json`);
      if (!res.ok) {
        // Fallback local
        res = await fetch('posts/index.json');
      }
      if (!res.ok) throw new Error('404');
      
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
    try {
      let res = await fetch(`${REPO_RAW}/posts/search-index.json`);
      if (!res.ok) res = await fetch('posts/search-index.json');
      if (res.ok) {
        const dados = await res.json();
        dados.forEach(item => { searchIndex[item.slug] = item.conteudo; });
      }
    } catch (e) { }
  }

  function construirFiltros() {
    const container = document.getElementById('filtrosContainer');
    if (!container) return;
    const categorias = [...new Set(todosPosts.map(p => p.categoria_id))].filter(Boolean);
    categorias.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filtro-btn';
      btn.textContent = cat;
      btn.onclick = () => filtrar(cat, btn);
      container.appendChild(btn);
    });
  }

  function renderizarPosts(posts) {
    const loading = document.getElementById('postsLoading');
    const dest = document.getElementById('postsDestaque');
    const grid = document.getElementById('postsGrid');
    if (loading) loading.style.display = 'none';
    if (!posts || posts.length === 0) return;

    const p0 = posts[0];
    if (dest) {
      dest.innerHTML = `<a href="post.html?slug=${p0.slug}" class="post-destaque"><h2>${p0.titulo}</h2><p>${p0.resumo}</p></a>`;
    }
    const restantes = posts.slice(1);
    if (grid) {
      grid.style.display = 'grid';
      grid.innerHTML = restantes.map(p => `<a href="post.html?slug=${p.slug}" class="post-card"><h3>${p.titulo}</h3></a>`).join('');
    }
  }

  function filtrar(cat, btn) {
    const filtrados = (cat === 'todos') ? todosPosts : todosPosts.filter(p => p.categoria_id === cat);
    renderizarPosts(filtrados);
  }

  window.cadastrarBlog = async function() { alert('Inscrição em breve!'); };

  carregarPosts();
})();
