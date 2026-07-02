// Lógica de abas sticky com scroll sync

(function() {
  const tabs      = document.querySelectorAll('.tab-btn');
  const blocos    = ['educar','planejar','investir'].map(id => document.getElementById('bloco-' + id));
  const indicator = document.getElementById('tabIndicator');
  const tabsWrap  = document.getElementById('servicosTabs');
  if (!tabs.length || !indicator || !tabsWrap) return;

  function moveIndicator(btn) {
    const wrapRect = tabsWrap.getBoundingClientRect();
    const btnRect  = btn.getBoundingClientRect();
    indicator.style.left  = (btnRect.left - wrapRect.left - 4) + 'px';
    indicator.style.width = btnRect.width + 'px';
  }

  function setActive(tabId, animate) {
    tabs.forEach(t => {
      const isActive = t.dataset.tab === tabId;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (isActive) {
        if (!animate) {
          indicator.style.transition = 'none';
          requestAnimationFrame(() => {
            moveIndicator(t);
            requestAnimationFrame(() => {
              indicator.style.transition = '';
            });
          });
        } else {
          moveIndicator(t);
        }
      }
    });
  }

  setActive('educar', false);

  let scrollingTo = null;
  let scrollTimer = null;

  window.irParaServico = function scrollToServico(id) {
    setActive(id, true);
    const bloco = document.getElementById('bloco-' + id);
    if (!bloco) return;

    const hdrH   = document.getElementById('hdr')?.offsetHeight || 56;
    const wrap   = document.querySelector('.servicos-tabs-wrap');
    const isSticky = wrap && getComputedStyle(wrap).position === 'sticky';
    const tabsH  = isSticky ? (wrap?.offsetHeight || 48) : 0;
    const offset = hdrH + tabsH + 8;
    const blocoTop = bloco.getBoundingClientRect().top + window.scrollY;

    scrollingTo = id;
    clearTimeout(scrollTimer);
    window.scrollTo({ top: blocoTop - offset, behavior: 'smooth' });
    scrollTimer = setTimeout(() => { scrollingTo = null; }, 800);
  };

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      window.irParaServico(btn.dataset.tab);
    });
  });

  function detectBlocoAtivo() {
    if (scrollingTo !== null) return;

    const hdrH  = document.getElementById('hdr')?.offsetHeight || 56;
    const tabsH = document.querySelector('.servicos-tabs-wrap')?.offsetHeight || 48;
    const offset = hdrH + tabsH;
    const linha = offset + 32;

    let ativo = null;
    blocos.forEach(bloco => {
      if (!bloco) return;
      const rect = bloco.getBoundingClientRect();
      if (rect.top <= linha) {
        ativo = bloco.id.replace('bloco-', '');
      }
    });

    if (ativo) setActive(ativo, true);
  }

  window.addEventListener('scroll', detectBlocoAtivo, { passive: true });
  detectBlocoAtivo();

  window.addEventListener('resize', () => {
    const active = tabsWrap.querySelector('.tab-btn.active');
    if (active) moveIndicator(active);
  }, { passive: true });
})();
