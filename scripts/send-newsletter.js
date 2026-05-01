// scripts/send-newsletter.js
//
// Lê os arquivos .md adicionados no push, verifica se têm `edicao`
// no frontmatter, converte para o template HTML e envia via Resend.

const fs      = require('fs');
const path    = require('path');
const matter  = require('gray-matter');
const { marked } = require('marked');

const RESEND_API_KEY     = process.env.RESEND_API_KEY;
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;
const ADDED_FILES        = process.env.ADDED_FILES || '';
const SITE_URL           = 'https://clararamalho.com.br';
const FROM               = 'Clara Ramalho <newsletter@clararamalho.com.br>';

// ── Formatar data pt-BR ──────────────────────────────────
function formatarData(dataStr) {
  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const [ano, mes, dia] = dataStr.split('-');
  return `${parseInt(dia)} ${meses[parseInt(mes) - 1]} ${ano}`;
}

// ── Converter Markdown para blocos HTML do template ──────
function markdownParaHtml(conteudo) {
  // Configura marked para gerar HTML limpo
  marked.setOptions({ breaks: false, gfm: true });

  const tokens = marked.lexer(conteudo);
  let html = '';

  for (const token of tokens) {
    switch (token.type) {

      case 'heading':
        if (token.depth === 2) {
          html += `
              <p style="margin: 1.8rem 0 0.6rem 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 1.1rem; font-weight: 600; letter-spacing: -0.01em; color: #0B1F3A;">${token.text}</p>`;
        }
        break;

      case 'paragraph': {
        // Detecta itálico de citação (linha que começa com *)
        const textoHtml = marked.parseInline(token.text)
          .replace(/<strong>/g, '<strong style="color:#0B1F3A;">')
          .replace(/<a /g, '<a style="color:#4A7DBF;" ');

        // Blockquote inline (parágrafo todo em itálico iniciado por *)
        if (token.text.startsWith('*') && token.text.endsWith('*') && !token.text.startsWith('**')) {
          const inner = token.text.slice(1, -1);
          html += `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 1.5rem 0;">
                <tr>
                  <td style="background-color: #E8EDF2; border-left: 3px solid #4A7DBF; border-radius: 0 6px 6px 0; padding: 1rem 1.5rem;">
                    <p style="margin:0; font-family: Arial, Helvetica, sans-serif; font-size: 0.92rem; font-style: italic; line-height: 1.75; color: #0B1F3A;">${marked.parseInline(inner)}</p>
                  </td>
                </tr>
              </table>`;
        } else {
          html += `
              <p style="margin: 0 0 1.2rem 0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem; line-height: 1.85; color: #2C3E50;">${textoHtml}</p>`;
        }
        break;
      }

      case 'blockquote': {
        const innerText = token.tokens
          .filter(t => t.type === 'paragraph')
          .map(t => marked.parseInline(t.text))
          .join('<br/>');
        html += `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 1.5rem 0;">
                <tr>
                  <td style="background-color: #E8EDF2; border-left: 3px solid #4A7DBF; border-radius: 0 6px 6px 0; padding: 1rem 1.5rem;">
                    <p style="margin:0; font-family: Arial, Helvetica, sans-serif; font-size: 0.92rem; font-style: italic; line-height: 1.75; color: #0B1F3A;">${innerText}</p>
                  </td>
                </tr>
              </table>`;
        break;
      }

      case 'list': {
        let itens = '';
        for (const item of token.items) {
          const textoItem = marked.parseInline(item.text)
            .replace(/<strong>/g, '<strong style="color:#0B1F3A;">')
            .replace(/<a /g, '<a style="color:#4A7DBF;" ');
          itens += `
                <tr>
                  <td style="padding: 0.3rem 0 0.3rem 1rem; font-family: Arial, Helvetica, sans-serif; font-size: 0.92rem; line-height: 1.7; color: #2C3E50; border-left: 2px solid #E8EDF2;">${textoItem}</td>
                </tr>
                <tr><td style="height:6px;"></td></tr>`;
        }
        html += `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 1.2rem 0;">
                ${itens}
              </table>`;
        break;
      }

      case 'hr':
        html += `
              <hr style="border:none; border-top: 1px solid #E8EDF2; margin: 1.5rem 0;" />`;
        break;

      default:
        break;
    }
  }

  return html;
}

// ── Montar HTML completo do e-mail ───────────────────────
function montarEmail({ titulo, resumo, categoria, data, edicao, slug, corpo }) {
  const dataFormatada = formatarData(data);
  const linkPost      = `${SITE_URL}/post.html?slug=${slug}`;
  const corpoHtml     = markdownParaHtml(corpo);

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${titulo}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; background-color: #F0F4F8; }
    a { color: #4A7DBF; text-decoration: underline; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content-pad { padding: 1.5rem 1.2rem !important; }
      .hero-pad { padding: 1.8rem 1.2rem !important; }
      .footer-pad { padding: 1.5rem 1.2rem !important; }
      h1 { font-size: 1.5rem !important; }
      .cta-btn { display: block !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#F0F4F8;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F0F4F8;">
    <tr>
      <td align="center" style="padding: 2rem 1rem;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow: 0 2px 24px rgba(11,31,58,0.07);">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#0B1F3A; padding: 2rem 2.5rem;" class="hero-pad">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 0.4rem 0; font-family: Arial, Helvetica, sans-serif; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(192,200,212,0.6);">Newsletter Quinzenal</p>
                    <p style="margin:0 0 0.1rem 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 1.4rem; font-weight: 600; letter-spacing: -0.02em; color: #FFFFFF;">Clara Ramalho</p>
                    <p style="margin:0; font-family: Arial, Helvetica, sans-serif; font-size: 0.8rem; font-weight: 300; color: rgba(192,200,212,0.55);">Consultoria Financeira</p>
                  </td>
                  <td align="right" valign="middle">
                    <p style="margin:0; font-family: Arial, Helvetica, sans-serif; font-size: 0.72rem; color: rgba(192,200,212,0.4); text-align:right; line-height:1.6;">Edição #${edicao}<br />${dataFormatada}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divisor colorido -->
          <tr>
            <td style="height:3px; background: linear-gradient(90deg, #4A7DBF 0%, #1A3358 100%);"></td>
          </tr>

          <!-- CONTEÚDO -->
          <tr>
            <td style="padding: 2.5rem 2.5rem 0.5rem;" class="content-pad">
              <p style="margin: 0 0 0.9rem 0; font-family: Arial, Helvetica, sans-serif; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #4A7DBF;">${categoria}</p>
              <h1 style="margin: 0 0 1rem 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 1.8rem; font-weight: 600; letter-spacing: -0.025em; line-height: 1.2; color: #0B1F3A;">${titulo}</h1>
              <p style="margin: 0 0 1.5rem 0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem; font-style: italic; line-height: 1.7; color: #6B7A8D;">${resumo}</p>
              <hr style="border:none; border-top: 1px solid #E8EDF2; margin: 0 0 1.8rem 0;" />
              ${corpoHtml}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 1rem 2.5rem 2rem;" class="content-pad">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #0B1F3A; border-radius: 4px;">
                    <a href="${linkPost}" class="cta-btn" style="display: inline-block; padding: 0.85rem 2rem; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 0.88rem; font-weight: 600; letter-spacing: 0.02em; color: #FFFFFF; text-decoration: none;">Continuar a leitura →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DIVISOR -->
          <tr>
            <td style="padding: 0 2.5rem;" class="content-pad">
              <hr style="border:none; border-top: 1px solid #E8EDF2; margin: 0;" />
            </td>
          </tr>

          <!-- ASSINATURA -->
          <tr>
            <td style="padding: 1.8rem 2.5rem;" class="content-pad">
              <p style="margin: 0 0 0.3rem 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 0.88rem; font-weight: 600; color: #0B1F3A;">Clara Ramalho</p>
              <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 0.78rem; line-height: 1.65; color: #6B7A8D;">Consultora de Investimentos Independente · CEA ANBIMA · Registro CVM<br />
                <a href="https://linkedin.com/in/clararamalho" style="color: #4A7DBF;">LinkedIn</a>
                &nbsp;·&nbsp;
                <a href="${SITE_URL}" style="color: #4A7DBF;">clararamalho.com.br</a>
              </p>
            </td>
          </tr>

          <!-- CTA ENCAMINHADO -->
          <tr>
            <td style="padding: 0 2.5rem 1.8rem;" class="content-pad">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color: #F0F4F8; border-radius: 4px; padding: 0.9rem 1.5rem;">
                    <p style="margin:0; font-family: Arial, Helvetica, sans-serif; font-size: 0.78rem; color: #6B7A8D;">Recebeu este e-mail encaminhado?
                    <a href="${SITE_URL}#newsletter" style="color: #4A7DBF; font-weight: 600;">Cadastre-se aqui.</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- DIVISOR -->
          <tr>
            <td style="padding: 0 2.5rem;" class="content-pad">
              <hr style="border:none; border-top: 1px solid #E8EDF2; margin: 0;" />
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #060F1D; padding: 1.8rem 2.5rem;" class="footer-pad">
              <p style="margin: 0 0 0.5rem 0; font-family: Arial, Helvetica, sans-serif; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(192,200,212,0.5);">Disclaimer e Informações Legais</p>
              <p style="margin: 0 0 0.8rem 0; font-family: Arial, Helvetica, sans-serif; font-size: 0.7rem; line-height: 1.7; color: rgba(192,200,212,0.35);"><strong style="color: rgba(192,200,212,0.5); font-weight:500;">Clara Ramalho</strong> — Consultora de Investimentos Independente habilitada pela CVM conforme a Resolução CVM nº 19. Certificação: CEA ANBIMA.</p>
              <p style="margin: 0 0 0.3rem 0; font-family: Arial, Helvetica, sans-serif; font-size: 0.7rem; line-height: 1.65; color: rgba(192,200,212,0.28);"><strong style="color: rgba(192,200,212,0.38); font-weight:500;">Risco de Mercado:</strong> Investimentos envolvem riscos. Rentabilidade passada não representa garantia futura.</p>
              <p style="margin: 0 0 0.3rem 0; font-family: Arial, Helvetica, sans-serif; font-size: 0.7rem; line-height: 1.65; color: rgba(192,200,212,0.28);"><strong style="color: rgba(192,200,212,0.38); font-weight:500;">Caráter Informativo:</strong> Este conteúdo é exclusivamente educativo. Não constitui recomendação de compra ou venda de ativos.</p>
              <p style="margin: 0 0 1.2rem 0; font-family: Arial, Helvetica, sans-serif; font-size: 0.7rem; line-height: 1.65; color: rgba(192,200,212,0.28);"><strong style="color: rgba(192,200,212,0.38); font-weight:500;">Independência:</strong> Consultoria exercida de forma isenta, sem vínculo de exclusividade com instituições financeiras.</p>
              <p style="margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 0.68rem; color: rgba(192,200,212,0.25); text-align: center; line-height: 1.8;">
                © 2026 Clara Ramalho · Rio de Janeiro, RJ<br />
                <a href="{{unsubscribe_url}}" style="color: rgba(192,200,212,0.35); text-decoration: underline;">Descadastrar</a>
                &nbsp;·&nbsp;
                <a href="${SITE_URL}/politica-de-privacidade.html" style="color: rgba(192,200,212,0.35); text-decoration: underline;">Política de Privacidade</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Ver no navegador -->
        <p style="margin: 1rem 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 0.7rem; color: rgba(11,31,58,0.35); text-align:center;">
          <a href="{{view_in_browser_url}}" style="color: rgba(11,31,58,0.4); text-decoration: underline;">Ver no navegador</a>
        </p>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ── Buscar contatos da audience no Resend ────────────────
async function buscarContatos() {
  const res = await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`, {
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Erro ao buscar contatos: ${res.status}`);
  const data = await res.json();
  return (data.data || [])
    .filter(c => !c.unsubscribed)
    .map(c => c.email);
}

// ── Enviar e-mail via Resend ─────────────────────────────
async function enviarEmail({ to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao enviar: ${err}`);
  }
  return res.json();
}

// ── Main ─────────────────────────────────────────────────
async function main() {
  const arquivos = ADDED_FILES.trim().split(/\s+/).filter(Boolean);

  for (const arquivo of arquivos) {
    if (!fs.existsSync(arquivo)) {
      console.log(`Arquivo não encontrado: ${arquivo}`);
      continue;
    }

    const conteudo = fs.readFileSync(arquivo, 'utf-8');
    const { data: fm, content } = matter(conteudo);

    // Só dispara se tiver `edicao` no frontmatter
    if (!fm.edicao) {
      console.log(`${arquivo} sem campo edicao — ignorado.`);
      continue;
    }

    const slug = path.basename(arquivo, '.md');

    // Remove linha final de contato (itálico com link para contato)
    const corpoLimpo = content
      .replace(/\n---\n[\s\S]*$/, '')  // remove a partir do --- final
      .trim();

    const html = montarEmail({
      titulo:    fm.titulo,
      resumo:    fm.resumo,
      categoria: fm.categoria,
      data:      fm.data,
      edicao:    fm.edicao,
      slug,
      corpo:     corpoLimpo,
    });

    console.log(`Buscando contatos da audience...`);
    const contatos = await buscarContatos();
    console.log(`${contatos.length} contatos ativos encontrados.`);

    if (contatos.length === 0) {
      console.log('Nenhum contato ativo. Abortando.');
      continue;
    }

    // Resend aceita até 50 destinatários por chamada
    const BATCH = 50;
    for (let i = 0; i < contatos.length; i += BATCH) {
      const lote = contatos.slice(i, i + BATCH);
      await enviarEmail({
        to:      lote,
        subject: fm.titulo,
        html,
      });
      console.log(`Lote ${Math.floor(i / BATCH) + 1} enviado (${lote.length} destinatários).`);
    }

    console.log(`✓ Newsletter #${fm.edicao} "${fm.titulo}" enviada com sucesso.`);
  }
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
