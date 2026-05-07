// Header scroll e navegação

// Voltar ao topo
window.addEventListener('scroll', () => {
  document.getElementById('top-btn').classList.toggle('on', window.scrollY > 400);
}, { passive: true });

// Mobile nav
const mob = document.getElementById('mob');
document.getElementById('hbg').addEventListener('click', () => mob.classList.add('open'));
document.getElementById('mobClose').addEventListener('click', () => mob.classList.remove('open'));
mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mob.classList.remove('open')));

// NAV DROPDOWN
(function() {
  const btn   = document.getElementById('navServicosBtn');
  const panel = document.getElementById('navServicosPanel');
  const nub   = document.getElementById('navServicosNub');
  const nav   = document.getElementById('mainNav');
  if (!btn || !panel || !nub) return;

  let isOpen = false;
  let closeTimer = null;

  function positionPanel() {
    const btnRect = btn.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2 - navRect.left;
    const panelW = panel.offsetWidth;
    let left = btnCenterX - panelW / 2;
    const maxLeft = navRect.width - panelW;
    left = Math.max(0, Math.min(left, maxLeft));
    panel.style.setProperty('--panel-left', left + 'px');
    const nubX = btnCenterX - left - 5;
    nub.style.left = nubX + 'px';
  }

  function abrirDropdown() {
    clearTimeout(closeTimer);
    if (isOpen) return;
    isOpen = true;
    positionPanel();
    panel.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
  }

  window.fecharDropdown = function() {
    if (!isOpen) return;
    isOpen = false;
    panel.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
  };

  btn.addEventListener('mouseenter', abrirDropdown);
  btn.addEventListener('click', () => { isOpen ? fecharDropdown() : abrirDropdown(); });

  function scheduleClose() { closeTimer = setTimeout(fecharDropdown, 80); }
  btn.addEventListener('mouseleave', scheduleClose);
  panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  panel.addEventListener('mouseleave', scheduleClose);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) {
      fecharDropdown();
      btn.focus();
    }
  });

  document.addEventListener('click', e => {
    if (isOpen && !btn.contains(e.target) && !panel.contains(e.target)) {
      fecharDropdown();
    }
  });

  window.addEventListener('resize', () => { if (isOpen) positionPanel(); }, { passive: true });
})();
