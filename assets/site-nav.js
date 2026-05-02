(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var header = document.getElementById('siteNavHeader');
    var btn = document.getElementById('siteNavServicesBtn');
    var panel = document.getElementById('siteNavServicesPanel');
    var nub = document.getElementById('siteNavServicesNub');
    var nav = document.getElementById('siteNavMenu');
    var hamburger = document.getElementById('siteNavHamburger');
    var mobile = document.getElementById('siteMobileOverlay');
    var mobileClose = document.getElementById('siteMobileClose');
    var isOpen = false;
    var closeTimer = null;

    function positionPanel() {
      if (!btn || !panel || !nav || !nub) return;
      var btnRect = btn.getBoundingClientRect();
      var navRect = nav.getBoundingClientRect();
      var btnCenterX = btnRect.left + btnRect.width / 2 - navRect.left;
      var panelW = panel.offsetWidth;
      var left = btnCenterX - panelW / 2;
      var maxLeft = navRect.width - panelW;
      left = Math.max(0, Math.min(left, maxLeft));
      panel.style.setProperty('--panel-left', left + 'px');
      nub.style.left = (btnCenterX - left - 5) + 'px';
    }

    function openDropdown() {
      if (!btn || !panel) return;
      clearTimeout(closeTimer);
      if (isOpen) return;
      isOpen = true;
      positionPanel();
      panel.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
    }

    function closeDropdown() {
      if (!btn || !panel || !isOpen) return;
      isOpen = false;
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
    }

    window.fecharDropdown = window.fecharDropdown || closeDropdown;

    if (btn && panel) {
      btn.addEventListener('mouseenter', openDropdown);
      btn.addEventListener('click', function () {
        isOpen ? closeDropdown() : openDropdown();
      });
      btn.addEventListener('mouseleave', function () {
        closeTimer = setTimeout(closeDropdown, 80);
      });
      panel.addEventListener('mouseenter', function () {
        clearTimeout(closeTimer);
      });
      panel.addEventListener('mouseleave', function () {
        closeTimer = setTimeout(closeDropdown, 80);
      });
      panel.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeDropdown);
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && isOpen) {
          closeDropdown();
          btn.focus();
        }
      });
      document.addEventListener('click', function (event) {
        if (isOpen && !btn.contains(event.target) && !panel.contains(event.target)) {
          closeDropdown();
        }
      });
      window.addEventListener('resize', function () {
        if (isOpen) positionPanel();
      }, { passive: true });
    }

    if (hamburger && mobile) {
      hamburger.addEventListener('click', function () {
        var open = mobile.classList.toggle('open');
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
      });
    }

    function closeMobile() {
      if (!mobile) return;
      mobile.classList.remove('open');
      if (hamburger) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    }

    if (mobileClose) {
      mobileClose.addEventListener('click', closeMobile);
    }
    if (mobile) {
      mobile.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMobile);
      });
    }
  });
})();
