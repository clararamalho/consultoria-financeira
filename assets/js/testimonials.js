// Carrossel de depoimentos e fade in animation

// Depoimentos carrossel
window.initDepCarousel = function() {
  const track = document.getElementById('depTrack');
  if (!track) return;
  const dots = document.getElementById('depDots');
  const cards = [...track.querySelectorAll('.dep-card')];
  const btnP = document.getElementById('depPrev');
  const btnN = document.getElementById('depNext');
  if (!dots || !btnP || !btnN || !cards.length) return;
  let cur = 0;
  dots.innerHTML = '';

  function render() {
    const wrap = track.parentElement;
    const gap = parseFloat(getComputedStyle(track).gap) || 20;
    const cardW = cards[0].offsetWidth;
    const center = Math.max(0, (wrap.clientWidth - parseFloat(getComputedStyle(wrap).paddingLeft) - parseFloat(getComputedStyle(wrap).paddingRight) - cardW) / 2);
    track.style.transform = `translateX(${center - cur * (cardW + gap)}px)`;
    cards.forEach((c, i) => c.setAttribute('data-active', i === cur ? 'true' : 'false'));
    btnP.setAttribute('data-active', cur > 0 ? 'true' : 'false');
    btnN.setAttribute('data-active', cur < cards.length - 1 ? 'true' : 'false');
    dots.querySelectorAll('span').forEach((d, i) => d.classList.toggle('on', i === cur));
  }

  cards.forEach((_, i) => {
    const d = document.createElement('span');
    d.addEventListener('click', () => { cur = i; render(); });
    dots.appendChild(d);
  });

  btnP.onclick = () => { if (cur > 0) { cur--; render(); } };
  btnN.onclick = () => { if (cur < cards.length - 1) { cur++; render(); } };
  cards.forEach((c, i) => c.addEventListener('click', () => { cur = i; render(); }));
  if (window.__depCarouselRender) window.removeEventListener('resize', window.__depCarouselRender);
  window.__depCarouselRender = render;
  window.addEventListener('resize', render);
  render();
};
window.initDepCarousel();

// Fade in animation
const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); }), { threshold: 0.1 });
document.querySelectorAll('.fi-anim').forEach(el => io.observe(el));

// Serviços — hover para ativar card (se existir elemento .card)
const cards = document.querySelectorAll('.card');
cards.forEach(c => c.addEventListener('mouseenter', () => {
  cards.forEach(x => x.setAttribute('data-active', 'false'));
  c.setAttribute('data-active', 'true');
}));

// Newsletter floating cards
window.initFloatingCards = function(root) {
  (root || document).querySelectorAll('[data-floating-card]').forEach(card => {
    if (card.dataset.floatingReady === 'true') return;
    card.dataset.floatingReady = 'true';
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      card.style.setProperty('--rotation-y', `${(x - 0.5) * 9.6}deg`);
      card.style.setProperty('--rotation-x', `${(0.5 - y) * 9.6}deg`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rotation-x', '0deg');
      card.style.setProperty('--rotation-y', '0deg');
    });
  });
};
window.initFloatingCards(document);
