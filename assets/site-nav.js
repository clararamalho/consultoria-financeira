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

    function setupMobileFocusTrap() {
      if (!mobile) return;
      var focusableElements = mobile.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      var firstElement = focusableElements[0];
      var lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement) return;

      setTimeout(function () { firstElement.focus(); }, 50);

      mobile.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          closeMobile();
        } else if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      });
    }

    if (hamburger && mobile) {
      hamburger.addEventListener('click', function () {
        var open = mobile.classList.toggle('open');
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
        document.body.style.touchAction = open ? 'none' : '';
        if (open) setupMobileFocusTrap();
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
      document.body.style.touchAction = '';
    }

    if (mobileClose) {
      mobileClose.addEventListener('click', closeMobile);
    }
    if (mobile) {
      mobile.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMobile);
      });
    }

    var mobileServicesBtn = document.getElementById('siteMobileServicesBtn');
    var mobileServicesPanel = document.getElementById('siteMobileServicesPanel');

    if (mobileServicesBtn && mobileServicesPanel) {
      mobileServicesBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var isOpen = mobileServicesPanel.classList.toggle('open');
        mobileServicesBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      mobileServicesPanel.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileServicesPanel.classList.remove('open');
          mobileServicesBtn.setAttribute('aria-expanded', 'false');
          closeMobile();
        });
      });
    }

    // ── THEME TOGGLE ──
    var themeToggleBtn = document.getElementById('themeToggleBtn');
    var themeToggleDesktopBtn = document.getElementById('themeToggleDesktopBtn');
    var html = document.documentElement;

    function getSystemTheme() {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function getStoredTheme() {
      return localStorage.getItem('theme');
    }

    function setTheme(theme) {
      html.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
      }
      if (themeToggleDesktopBtn) {
        themeToggleDesktopBtn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
      }
    }

    function initTheme() {
      var stored = getStoredTheme();
      var theme = stored || getSystemTheme();
      setTheme(theme);
    }

    function toggleTheme() {
      var current = html.getAttribute('data-theme') || 'light';
      var newTheme = current === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', toggleTheme);

      themeToggleBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      });
    }

    if (themeToggleDesktopBtn) {
      themeToggleDesktopBtn.addEventListener('click', toggleTheme);

      themeToggleDesktopBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      });
    }

    // Initialize theme on load
    initTheme();

    // Listen for system theme changes if no stored preference
    if (!getStoredTheme()) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!getStoredTheme()) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  });
})();
// ── SCROLL: adiciona classe .scrolled ao header ──
    if (header) {
      function onScroll() {
        if (window.scrollY > 10) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
