document.addEventListener('DOMContentLoaded', function () {

  // ── MARKDOWN LOADER ──
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
    var html = '', lines = text.split('\n'), i = 0, inUl = false, inOl = false;
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
    var sections = [], current = null, counter = 0;
    var lines = md.split('\n'), i = 0, introLines = [];
    while (i < lines.length && !lines[i].startsWith('## ')) { introLines.push(lines[i]); i++; }
    while (i < lines.length) {
      var line = lines[i];
      if (line.startsWith('## ')) {
        if (current) sections.push(current);
        counter++;
        current = { num: (counter < 10 ? '0' : '') + counter, titulo: line.slice(3).trim(), conteudo: [] };
      } else if (current) {
        current.conteudo.push(line);
      }
      i++;
    }
    if (current) sections.push(current);
    var html = '', introMd = introLines.join('\n').trim();
    if (introMd) html += '<p class="legal-intro">' + renderInline(introMd) + '</p>';
    sections.forEach(function (sec) {
      html += '<div class="legal-secao"><div class="legal-secao-header">';
      html += '<span class="legal-secao-num">' + sec.num + '</span>';
      html += '<h2>' + renderInline(sec.titulo) + '</h2></div>';
      html += renderBlocks(sec.conteudo.join('\n')) + '</div>';
    });
    return html;
  }

  function loadLegalContent(mdUrl) {
    fetch(mdUrl)
      .then(function (r) { if (!r.ok) throw new Error('nao encontrado'); return r.text(); })
      .then(function (raw) {
        var p = parseFrontmatter(raw), meta = p.meta, body = p.body;
        var elT = document.getElementById('pageTitulo');
        var elC = document.getElementById('pageCategoria');
        var elD = document.getElementById('pageAtualizacao');
        var elB = document.getElementById('legalBody');
        if (elT && meta.titulo)      elT.textContent = meta.titulo;
        if (elC && meta.categoria)   elC.textContent = meta.categoria;
        if (elD && meta.atualizacao) elD.textContent = 'Ultima atualizacao: ' + meta.atualizacao;
        if (elB)                     elB.innerHTML   = mdToHtml(body);
      })
      .catch(function (err) { console.warn('[legal]', err.message); });
  }

  var pageName = document.location.pathname.split('/').pop().replace('.html', '');
  var mdMap = {
    'politica-de-privacidade': 'https://cdn.jsdelivr.net/gh/clararamalho/consultoria-financeira@main/content/politica.md',
    'termos-de-uso': 'https://cdn.jsdelivr.net/gh/clararamalho/consultoria-financeira@main/content/termos.md'
  };

  if (mdMap[pageName]) {
    loadLegalContent(mdMap[pageName]);
  }

});
