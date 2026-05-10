// Newsletter — carregamento de posts, busca e filtros

const REPO_RAW = 'https://cdn.jsdelivr.net/gh/clararamalho/consultoria-financeira@main';
const NEWSLETTER_WORKER_URL = 'https://newsletter-cadastro.m-clarard.workers.dev';
let todosPosts = [];
let searchIndex = {};

function formatarData(d) {
  if (!d) return '';
  const [ano, mes, dia] = d.split('-');
  return `${parseInt(dia)} ${'jan fev mar abr mai jun jul ago set out nov dez'.split(' ')[parseInt(mes)-1]} ${ano}`;
}

async function carregarPosts() {
  try {
    const res = await fetch(`${REPO_RAW}/posts/index.json`);
    if (!res.ok) throw new Error('erro');
    todosPosts = await res.json();
    construirFiltros();
    renderizarPosts(todosPosts);
    carregarSearchIndex();
  } catch {
    const loadingEl = document.getElementById('postsLoading');
    if (loadingEl) {
      loadingEl.textContent = 'Não foi possível carregar os posts.';
    }
  }
}

async function carregarSearchIndex() {
  try {
    const res = await fetch(`${REPO_RAW}/posts/search-index.json`);
    if (!res.ok) throw new Error('erro');
    const dados = await res.json();
    dados.forEach(item => {
      searchIndex[item.slug] = item.conteudo;
    });
  } catch {
    // Degrada silenciosamente — busca continua funcionando sem conteúdo
  }
}

function construirFiltros() {
  const nomes = {
    educacao: 'Educação Financeira',
    investimentos: 'Investimentos',
    planejamento: 'Planejamento Financeiro',
    tributacao: 'Tributação',
    'dados-mercado': 'Dados & Mercado'
  };
  const categorias = [...new Set(todosPosts.map(p => p.categoria_id))];
  const container = document.getElementById('filtrosContainer');
  if (!container) return;

  categorias.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filtro-btn';
    btn.textContent = nomes[cat] || cat;
    btn.addEventListener('click', () => filtrar(cat, btn));
    container.appendChild(btn);
  });
}

function renderizarPosts(posts) {
  const loadingEl = document.getElementById('postsLoading');
  const destDiv = document.getElementById('postsDestaque');
  const grid = document.getElementById('postsGrid');
  const buscaVaziaEl = document.getElementById('buscaVazia');

  if (loadingEl) loadingEl.style.display = 'none';
  if (buscaVaziaEl) buscaVaziaEl.style.display = 'none';

  if (posts.length === 0) {
    if (destDiv) destDiv.innerHTML = '<div class="posts-vazio">Nenhum post encontrado nessa categoria.</div>';
    if (grid) {
      grid.style.display = 'none';
      grid.innerHTML = '';
    }
    return;
  }

  // destaque
  const p0 = posts[0];
  if (destDiv) {
    destDiv.innerHTML = `
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
  if (restantes.length === 0) {
    if (grid) {
      grid.style.display = 'none';
      grid.innerHTML = '';
    }
    return;
  }

  if (grid) {
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

function filtrar(cat, btn) {
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');
  const buscaInput = document.getElementById('buscaInput');
  if (buscaInput) buscaInput.value = '';
  const filtrados = cat === 'todos' ? todosPosts : todosPosts.filter(p => p.categoria_id === cat);
  renderizarPosts(filtrados);
}

function buscar(termo) {
  const t = termo.trim().toLowerCase();
  const filtrados = todosPosts.filter(p => {
    const emMetadados =
      p.titulo.toLowerCase().includes(t) ||
      (p.resumo || '').toLowerCase().includes(t) ||
      (p.categoria || '').toLowerCase().includes(t);

    const emConteudo = searchIndex[p.slug] && searchIndex[p.slug].toLowerCase().includes(t);

    return emMetadados || emConteudo;
  });

  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
  const firstBtn = document.querySelector('.filtro-btn');
  if (firstBtn) firstBtn.classList.add('ativo');

  const buscaVaziaEl = document.getElementById('buscaVazia');
  const destDiv = document.getElementById('postsDestaque');
  const grid = document.getElementById('postsGrid');

  if (t && filtrados.length === 0) {
    if (destDiv) destDiv.innerHTML = '';
    if (grid) grid.style.display = 'none';
    if (buscaVaziaEl) {
      buscaVaziaEl.style.display = 'block';
      const buscaTermo = document.getElementById('buscaTermo');
      if (buscaTermo) buscaTermo.textContent = termo.trim();
    }
  } else {
    if (buscaVaziaEl) buscaVaziaEl.style.display = 'none';
    renderizarPosts(t ? filtrados : todosPosts);
  }
}

async function cadastrarBlog() {
  const email = document.getElementById('nl-email-blog');
  if (!email) return;

  const emailValue = email.value.trim();
  const btn = document.querySelector('.nl-form button');

  if (!emailValue) {
    alert('Por favor, informe seu e-mail.');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Cadastrando...';
  }

  try {
    const res = await fetch(`${NEWSLETTER_WORKER_URL}/cadastrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: '', email: emailValue }),
    });
    const data = await res.json();
    if (data.ok) {
      const nlForm = document.getElementById('nlForm');
      const nlSucesso = document.getElementById('nlSucesso');
      if (nlForm) nlForm.style.display = 'none';
      if (nlSucesso) nlSucesso.style.display = 'block';
    } else {
      alert(data.error || 'Ocorreu um erro. Tente novamente.');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Quero receber';
      }
    }
  } catch {
    alert('Erro de conexão. Tente novamente.');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Quero receber';
    }
  }
}

// Inicialização quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
  // Carregar posts
  carregarPosts();

  // Event listener para busca via input
  const buscaInput = document.getElementById('buscaInput');
  if (buscaInput) {
    buscaInput.addEventListener('input', (event) => {
      buscar(event.target.value);
    });
  }

  // Event listener para botão de voltar ao topo (scroll)
  const topBtn = document.getElementById('top-btn');
  if (topBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        topBtn.classList.add('on');
      } else {
        topBtn.classList.remove('on');
      }
    }, { passive: true });

    // Click handler para o botão de topo
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Event listener para o botão "Todos" (filtro inicial)
  const todosBtn = document.querySelector('.filtro-btn.ativo');
  if (todosBtn && todosBtn.textContent === 'Todos') {
    todosBtn.addEventListener('click', () => filtrar('todos', todosBtn));
  }

  // Event listener para o botão de cadastro newsletter
  const cadastroBtn = document.querySelector('.nl-form button');
  if (cadastroBtn) {
    cadastroBtn.addEventListener('click', cadastrarBlog);
  }
});
