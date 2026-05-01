// ── INICIALIZAÇÃO DO HEADER/MENU ────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  window.addEventListener('scroll', function () {
    var h = document.getElementById('siteHeader');
    if (h) h.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  var hamburger   = document.getElementById('hamburger');
  var mobileMenu  = document.getElementById('mobileMenu');
  var mobileClose = document.getElementById('mobileClose');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }
  if (mobileClose) {
    mobileClose.addEventListener('click', function () {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
});

// ── MARKDOWN CONTENT LOADER ──────────────────────────────────────────
function initLegal(mdFile) {

  function parseFrontmatter(raw) {
    var first  = raw.indexOf('---');
    var second = raw.indexOf('---', first + 3);
    if (first === -1 || second === -1) return { meta: {}, body: raw };
    var yaml = raw.slice(first + 3, second).trim();
    var body = raw.slice(second + 3).trim();
    var meta = {};
    yaml.split('\n').forEach(function (line) {
      var colon = line.indexOf(':');
      if (colon === -1) return;
      var key = line.slice(0, colon).trim();
      var val = line.slice(colon + 1).trim().replace(/^['"]|['"]$/g, '');
      meta[key] = val;
    });
    return { meta: meta, body: body };
  }

  function renderInline(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }

  function renderBlocks(text) {
    var html  = '';
    var lines = text.split('\n');
    var i     = 0;
    var inUl  = false;
    var inOl  = false;

    function closeList() {
      if (inUl) { html += '</ul>'; inUl = false; }
      if (inOl) { html += '</ol>'; inOl = false; }
    }

    while (i < lines.length) {
      var line = lines[i].trimEnd();
      if (!line.trim()) { closeList(); i++; continue; }

      if (/^[-*] /.test(line)) {
        if (!inUl) { closeList(); html += '<ul>'; inUl = true; }
        html += '<li>' + renderInline(line.replace(/^[-*] /, '')) + '</li>';
        i++; continue;
      }
      if (/^\d+\. /.test(line)) {
        if (!inOl) { closeList(); html += '<ol>'; inOl = true; }
        html += '<li>' + renderInline(line.replace(/^\d+\. /, '')) + '</li>';
        i++; continue;
      }
      closeList();
      html += '<p>' + renderInline(line) + '</p>';
      i++;
    }
    closeList();
    return html;
  }

  function mdToHtml(md) {
    var sections   = [];
    var current    = null;
    var counter    = 0;
    var lines      = md.split('\n');
    var i          = 0;
    var introLines = [];

    // Coleta linhas antes do primeiro ##
    while (i < lines.length && !lines[i].startsWith('## ')) {
      introLines.push(lines[i]);
      i++;
    }

    // Coleta seções
    while (i < lines.length) {
      var line = lines[i];
      if (line.startsWith('## ')) {
        if (current) sections.push(current);
        counter++;
        var num = counter < 10 ? '0' + counter : '' + counter;
        current = { num: num, titulo: line.slice(3).trim(), conteudo: [] };
      } else if (current) {
        current.conteudo.push(line);
      }
      i++;
    }
    if (current) sections.push(current);

    var html     = '';
    var introMd  = introLines.join('\n').trim();
    if (introMd) {
      html += '<p class="legal-intro">' + renderInline(introMd) + '</p>';
    }

    sections.forEach(function (sec) {
      html += '<div class="legal-secao">';
      html += '<div class="legal-secao-header">';
      html += '<span class="legal-secao-num">' + sec.num + '</span>';
      html += '<h2>' + renderInline(sec.titulo) + '</h2>';
      html += '</div>';
      html += renderBlocks(sec.conteudo.join('\n'));
      html += '</div>';
    });

    return html;
  }

  // Fetch do arquivo .md
  fetch(mdFile)
    .then(function (r) {
      if (!r.ok) throw new Error(mdFile + ' nao encontrado');
      return r.text();
    })
    .then(function (raw) {
      var parsed = parseFrontmatter(raw);
      var meta   = parsed.meta;
      var body   = parsed.body;

      var elTitulo = document.getElementById('pageTitulo');
      var elCat    = document.getElementById('pageCategoria');
      var elData   = document.getElementById('pageAtualizacao');
      var elBody   = document.getElementById('legalBody');

      if (elTitulo && meta.titulo)      elTitulo.textContent = meta.titulo;
      if (elCat    && meta.categoria)   elCat.textContent    = meta.categoria;
      if (elData   && meta.atualizacao) elData.textContent   = 'Ultima atualizacao: ' + meta.atualizacao;
      if (elBody)                       elBody.innerHTML     = mdToHtml(body);
    })
    .catch(function (err) {
      console.warn('[legal.js]', err.message, '— conteudo estatico mantido.');
    });
}
