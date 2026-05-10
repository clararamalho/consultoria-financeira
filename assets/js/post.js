(function() {
    // Populate og:image dynamically from post image
    document.addEventListener("DOMContentLoaded", function() {
        var img = document.querySelector("article img, .post-hero img, .post-cover img");
        if (img) {
            var meta = document.getElementById("og-image-meta");
            if (meta) meta.setAttribute("content", img.src);
        }
    });

    // ── CONSTANTES ──
    const WORKER_URL           = 'https://formulario-contato.m-clarard.workers.dev';
    const REPO_RAW             = 'https://cdn.jsdelivr.net/gh/clararamalho/consultoria-financeira@main';
    const NEWSLETTER_WORKER_URL = 'https://newsletter-cadastro.m-clarard.workers.dev';

    const params = new URLSearchParams(window.location.search);
    const slug   = params.get('slug');
    let todosOsPosts = [];

    if (!slug) { mostrarErro(); } else { iniciar(); }

    // ── INICIALIZAÇÃO ──
    async function iniciar() {
        try {
            const [resPosts, resMd] = await Promise.all([
                fetch(`${REPO_RAW}/posts/index.json`),
                fetch(`${REPO_RAW}/posts/${slug}.md`)
            ]);
            if (!resMd.ok) throw new Error('not found');
            todosOsPosts = resPosts.ok ? await resPosts.json() : [];
            renderizarPost(await resMd.text());
            renderizarNav();
        } catch { mostrarErro(); }
    }

    // ── PARSERS ──
    function parseFrontmatter(texto) {
        const match = texto.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (!match) return { meta: {}, conteudo: texto };
        const meta = {};
        match[1].split('\n').forEach(linha => {
            const [chave, ...valor] = linha.split(':');
            if (chave && valor.length) meta[chave.trim()] = valor.join(':').trim().replace(/^"|"$/g, '');
        });
        return { meta, conteudo: match[2] };
    }

    function estimarLeitura(texto) {
        return `${Math.ceil(texto.trim().split(/\s+/).length / 200)} min de leitura`;
    }

    function formatarData(d) {
        if (!d) return '';
        const [ano, mes, dia] = d.split('-');
        return `${parseInt(dia)} ${'jan fev mar abr mai jun jul ago set out nov dez'.split(' ')[parseInt(mes)-1]} ${ano}`;
    }

    // ── RENDERIZAÇÃO ──
    function renderizarPost(texto) {
        const { meta, conteudo } = parseFrontmatter(texto);

        // <title> e metas
        if (meta.titulo) {
            document.title = `${meta.titulo} · Clara Ramalho`;
            document.getElementById('pageTitle').textContent = `${meta.titulo} · Clara Ramalho`;
            document.getElementById('ogTitle').content = meta.titulo;
        }
        if (meta.resumo) {
            document.getElementById('metaDesc').content = meta.resumo;
            document.getElementById('ogDesc').content   = meta.resumo;
        }
        // Atualizar canonical e og:url com slug
        const slugUrl = slug ? `https://clararamalho.com.br/post.html?slug=${encodeURIComponent(slug)}` : 'https://clararamalho.com.br/post.html';
        const canonicalLink = document.getElementById('canonicalLink');
        if (canonicalLink) {
            canonicalLink.href = slugUrl;
        }
        const ogUrlMeta = document.getElementById('ogUrl');
        if (ogUrlMeta) {
            ogUrlMeta.content = slugUrl;
        }

        // Hero
        document.getElementById('postTag').textContent          = meta.categoria || 'Newsletter';
        document.getElementById('postTitulo').textContent       = meta.titulo    || '';
        document.getElementById('postResumo').textContent       = meta.resumo    || '';
        document.getElementById('postData').textContent         = formatarData(meta.data);
        document.getElementById('postLeitura').textContent      = estimarLeitura(conteudo);
        document.getElementById('breadcrumbTitulo').textContent = meta.titulo    || 'Post';

        // Conteúdo
        document.getElementById('postContent').innerHTML = marked.parse(conteudo);

        // Preencher BlogPosting ld+json
        const datePublished = meta.data ? `${meta.data}T00:00:00Z` : new Date().toISOString();
        const ldJson = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": meta.titulo || "Post",
            "description": meta.resumo || "",
            "datePublished": datePublished,
            "author": {
                "@type": "Person",
                "name": "Clara Ramalho"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Clara Ramalho Consultoria Financeira"
            },
            "url": window.location.href
        };
        const ldJsonEl = document.getElementById('postLdJson');
        if (ldJsonEl) ldJsonEl.textContent = JSON.stringify(ldJson);

        // Interceptar links de contato
        document.querySelectorAll('.post-content a').forEach(a => {
            const href = a.getAttribute('href') || '';
            if (href.includes('contato')) {
                a.href = '#';
                a.addEventListener('click', e => { e.preventDefault(); abrirModalContato(); });
            }
        });

        // Mostrar
        document.getElementById('postLoading').style.display  = 'none';
        document.getElementById('postWrapper').style.display  = 'block';
    }

    function renderizarNav() {
        const idx  = todosOsPosts.findIndex(p => p.slug === slug);
        const prev = todosOsPosts[idx + 1];
        const next = todosOsPosts[idx - 1];
        const nav  = document.getElementById('postNav');
        if (!prev && !next) { nav.style.display = 'none'; return; }
        nav.innerHTML = `
        ${prev ? `<a href="post.html?slug=${prev.slug}" class="post-nav-item prev">
          <span class="post-nav-label">← Anterior</span>
          <span class="post-nav-titulo">${prev.titulo}</span>
        </a>` : '<div></div>'}
        ${next ? `<a href="post.html?slug=${next.slug}" class="post-nav-item next">
          <span class="post-nav-label">Próximo →</span>
          <span class="post-nav-titulo">${next.titulo}</span>
        </a>` : '<div></div>'}
      `;
    }

    function mostrarErro() {
        const loading = document.getElementById('postLoading');
        const erro = document.getElementById('postErro');
        if (loading) loading.style.display = 'none';
        if (erro) erro.style.display = 'block';
    }

    window.addEventListener('scroll', () => {
        const btn = document.getElementById('voltarTopo');
        if (btn) btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    // ── MODAL CONTATO ──
    window.abrirModalContato = function() {
        const modal = document.getElementById('modalContato');
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    };
    window.fecharModalContato = function() {
        const modal = document.getElementById('modalContato');
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    };
    
    const modalContato = document.getElementById('modalContato');
    if (modalContato) {
        modalContato.addEventListener('click', e => {
            if (e.target === modalContato) fecharModalContato();
        });
    }

    window.enviarContato = async function() {
        const nome     = document.getElementById('mc-nome').value.trim();
        const email    = document.getElementById('mc-email').value.trim();
        const telefone = document.getElementById('mc-telefone').value.trim();
        const mensagem = document.getElementById('mc-mensagem').value.trim();
        const btn      = document.querySelector('#formContato .btn-enviar');
        if (!nome || !email || !mensagem) { alert('Por favor, preencha todos os campos.'); return; }
        btn.disabled = true; btn.textContent = 'Enviando...';
        try {
            const res  = await fetch(WORKER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome, email, telefone, mensagem }) });
            const data = await res.json();
            if (data.ok) {
                document.getElementById('formContato').style.display    = 'none';
                document.getElementById('sucessoContato').style.display = 'block';
            } else { alert('Ocorreu um erro. Tente novamente.'); btn.disabled = false; btn.textContent = 'Enviar mensagem'; }
        } catch { alert('Erro de conexão. Tente novamente.'); btn.disabled = false; btn.textContent = 'Enviar mensagem'; }
    };

    // ── CTA NEWSLETTER ──
    window.cadastrarCTA = async function() {
        const email = document.getElementById('cta-email').value.trim();
        const btn   = document.querySelector('.cta-form button');
        if (!email) { alert('Por favor, informe seu e-mail.'); return; }
        btn.disabled = true; btn.textContent = 'Cadastrando...';
        try {
            const res  = await fetch(`${NEWSLETTER_WORKER_URL}/cadastrar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: '', email }) });
            const data = await res.json();
            if (data.ok) {
                document.getElementById('ctaForm').style.display    = 'none';
                document.getElementById('ctaSucesso').style.display = 'block';
            } else { alert(data.error || 'Ocorreu um erro. Tente novamente.'); btn.disabled = false; btn.textContent = 'Quero receber'; }
        } catch { alert('Erro de conexão. Tente novamente.'); btn.disabled = false; btn.textContent = 'Quero receber'; }
    };

    // ── POPUP NEWSLETTER ──
    (function () {
        const overlay     = document.getElementById('popupNewsletter');
        const btnClose    = document.getElementById('popupClose');
        if (!overlay || !btnClose) return;
        
        const STORAGE_KEY = `nl_popup_${slug}`;

        let popupJaFechado = false;
        try {
            popupJaFechado = sessionStorage.getItem(STORAGE_KEY) === '1';
        } catch (e) {
            popupJaFechado = false;
        }
        if (popupJaFechado) return;

        function abrirPopup() {
            overlay.classList.add('open');
            window.removeEventListener('scroll', onScroll);
        }
        function fecharPopup() {
            overlay.classList.remove('open');
            try {
                sessionStorage.setItem(STORAGE_KEY, '1');
            } catch (e) { }
        }
        function onScroll() {
            const scrolled = window.scrollY + window.innerHeight;
            const total    = document.documentElement.scrollHeight;
            if (scrolled / total >= 0.5) abrirPopup();
        }

        btnClose.addEventListener('click', fecharPopup);
        overlay.addEventListener('click', e => { if (e.target === overlay) fecharPopup(); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && overlay.classList.contains('open')) {
                fecharPopup();
            }
        });
        setTimeout(() => window.addEventListener('scroll', onScroll, { passive: true }), 1000);
    })();

    window.cadastrarPopup = async function() {
        const email = document.getElementById('popup-email').value.trim();
        const btn   = document.querySelector('.popup-inputs button');
        if (!email) { alert('Por favor, informe seu e-mail.'); return; }
        btn.disabled = true; btn.textContent = 'Cadastrando...';
        try {
            const res  = await fetch(`${NEWSLETTER_WORKER_URL}/cadastrar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: '', email }) });
            const data = await res.json();
            if (data.ok) {
                document.getElementById('popupForm').style.display    = 'none';
                document.getElementById('popupSucesso').style.display = 'block';
                setTimeout(() => {
                    const popup = document.getElementById('popupNewsletter');
                    if (popup) popup.classList.remove('open');
                    sessionStorage.setItem('nl_popup_fechado', '1');
                }, 3000);
            } else { alert(data.error || 'Ocorreu um erro. Tente novamente.'); btn.disabled = false; btn.textContent = 'Quero receber'; }
        } catch { alert('Erro de conexão. Tente novamente.'); btn.disabled = false; btn.textContent = 'Quero receber'; }
    };

    // ── CTA STICKY SCROLL ──
    (function() {
        var stickyCta = document.getElementById('postStickyCta');
        if (!stickyCta) return;

        var postContent = document.getElementById('postContent');
        if (!postContent) return;

        function checkScroll() {
            var contentHeight = postContent.offsetHeight;
            var contentTop = postContent.getBoundingClientRect().top;
            var scrolled = Math.abs(contentTop) / contentHeight;

            if (scrolled > 0.3) {
                stickyCta.classList.add('visible');
            } else {
                stickyCta.classList.remove('visible');
            }
        }

        window.addEventListener('scroll', checkScroll, { passive: true });
        checkScroll();
    })();
})();