/**
 * gerar-email.js
 * Converte um arquivo .md para o HTML do e-mail da newsletter.
 *
 * Como usar no VS Code:
 *   1. Abra o terminal (Ctrl + `)
 *   2. npm install marked
 *   3. node gerar-email.js newsletter-02.md
 *   4. O arquivo newsletter-02.html será gerado na mesma pasta
 */

const fs   = require("fs");
const path = require("path");
const { marked } = require("marked");

// ── Lê o arquivo .md ──────────────────────────────────────────────────────
const input = process.argv[2];
if (!input) {
  console.error("❌ Informe o arquivo .md: node gerar-email.js minha-newsletter.md");
  process.exit(1);
}

const mdRaw = fs.readFileSync(input, "utf-8");

// ── Lê o frontmatter (--- ... ---) ────────────────────────────────────────
function parseFrontmatter(raw) {
  // Normaliza quebras de linha Windows (CRLF) para Unix (LF)
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: normalized };

  const meta = {};
  match[1].split("\n").forEach((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim().replace(/^"|"$/g, "");
    if (key) meta[key] = val;
  });

  return { meta, body: match[2] };
}

const { meta, body } = parseFrontmatter(mdRaw);

// Suporte ao padrão do blog (edicao, categoria) e ao padrão antigo (numero, tema)
const edicao = meta.edicao   ? `#${String(meta.edicao).padStart(2, "0")}` : (meta.numero || "#00");
const titulo = meta.titulo   || "Sem título";
const tema   = meta.categoria || meta.tema || "";
const resumo = meta.resumo   || "";

// Formata a data: aceita "2026-04-30" ou texto livre
function formatarData(raw) {
  if (!raw) return new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
  const d = new Date(raw + "T12:00:00"); // evita fuso horário
  if (isNaN(d)) return raw.toUpperCase();
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
}

const data = formatarData(meta.data);

// ── Converte o corpo Markdown para HTML ───────────────────────────────────
marked.setOptions({ breaks: false });

const tokens = marked.lexer(body.trim());
let corpoHtml = "";

for (const token of tokens) {
  switch (token.type) {

    case "paragraph": {
      const textoHtml = marked.parseInline(token.text)
        .replace(/<strong>/g, '<strong style="color:#1A2A6C;font-weight:500;">')
        .replace(/<a /g,      '<a style="color:#00C0C8;" ');
      corpoHtml += `<p style="margin:0 0 1.2rem 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:300;line-height:1.85;color:#5A6785;">${textoHtml}</p>`;
      break;
    }

    case "heading": {
      const sizes = { 2: "18px", 3: "15px" };
      const sz = sizes[token.depth] || "15px";
      corpoHtml += `<h${token.depth} style="margin:1.5rem 0 0.5rem;font-family:Arial,Helvetica,sans-serif;font-size:${sz};font-weight:400;color:#1A2A6C;line-height:1.3;letter-spacing:-0.01em;">${token.text}</h${token.depth}>`;
      break;
    }

    case "list": {
      const tag = token.ordered ? "ol" : "ul";
      let itens = "";
      for (const item of token.items) {
        const textoItem = marked.parseInline(item.text)
          .replace(/<strong>/g, '<strong style="color:#1A2A6C;">')
          .replace(/<a /g,      '<a style="color:#00C0C8;" ');
        itens += `<li style="margin-bottom:0.5rem;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:300;line-height:1.75;color:#5A6785;">${textoItem}</li>`;
      }
      corpoHtml += `<${tag} style="margin:0 0 1.2rem 0;padding-left:1.4rem;">${itens}</${tag}>`;
      break;
    }

    case "blockquote": {
      const innerText = token.tokens
        .filter((t) => t.type === "paragraph")
        .map((t) => marked.parseInline(t.text))
        .join("<br/>");
      corpoHtml += `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:1.2rem 0;">
          <tr>
            <td style="background:#F7F8FC;border-left:3px solid #00C0C8;border-radius:0 6px 6px 0;padding:1rem 1.25rem;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-style:italic;line-height:1.75;color:#5A6785;">${innerText}</p>
            </td>
          </tr>
        </table>`;
      break;
    }

    case "hr":
      corpoHtml += `<hr style="border:none;border-top:1px solid rgba(26,42,108,0.08);margin:1.5rem 0;" />`;
      break;

    case "space":
      break;
  }
}

// ── Monta o HTML final ────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${titulo} · Clara Ramalho</title>
<style>
  body { background:#F7F8FC; margin:0; padding:40px 16px; font-family:Arial,Helvetica,sans-serif; }
@media screen and (max-width:480px) {
    table { width:100% !important; border-radius:0 !important; }
    h1 { font-size:22px !important; }
    p  { font-size:14px !important; }
  }
</style>
</head>
<body>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid rgba(26,42,108,0.10);border-radius:10px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">

  <!-- ACCENT TOP -->
  <tr><td style="height:3px;background:linear-gradient(90deg,#1A2A6C 0%,#00C0C8 100%);"></td></tr>

  <!-- HEADER -->
  <tr>
    <td style="padding:28px 40px 22px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="display:block;font-size:10px;font-weight:400;color:#9AA3B8;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Clara Ramalho, CEA · Consultoria Independente</span>
          </td>
          <td align="right" style="vertical-align:top;">
            <span style="font-size:10px;font-weight:400;color:#9AA3B8;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Newsletter ${edicao}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- HEADER DEGRADÊ -->
  <tr><td style="height:3px;background:linear-gradient(90deg,#1A2A6C 0%,#00C0C8 100%);"></td></tr>

  <!-- DATA -->
  <tr>
    <td style="padding:40px 40px 0;">
      <span style="font-size:10px;font-weight:400;letter-spacing:0.14em;text-transform:uppercase;color:#9AA3B8;font-family:Arial,Helvetica,sans-serif;">${data}</span>
    </td>
  </tr>

  ${tema ? `
  <!-- BADGE TEMA -->
  <tr>
    <td style="padding:12px 40px 0;">
      <span style="display:inline-block;font-size:10px;font-weight:400;letter-spacing:0.12em;text-transform:uppercase;color:#5A6785;background:#EDEEF5;border-radius:100px;padding:5px 14px;font-family:Arial,Helvetica,sans-serif;">${tema}</span>
    </td>
  </tr>` : ""}

  <!-- TÍTULO -->
  <tr>
    <td style="padding:10px 40px 0;">
      <h1 style="margin:0;font-size:26px;font-weight:300;color:#1A2A6C;line-height:1.25;letter-spacing:-0.03em;font-family:Arial,Helvetica,sans-serif;">${titulo}</h1>
    </td>
  </tr>

  <!-- DIVISOR -->
  <tr>
    <td style="padding:20px 40px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="width:32px;height:1px;background:#00C0C8;"></td>
          <td style="width:120px;height:1px;background:rgba(26,42,108,0.08);"></td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CORPO -->
  <tr>
    <td style="padding:28px 40px 0;">
      ${corpoHtml}
    </td>
  </tr>

  <!-- SPACER -->
  <tr><td style="height:40px;"></td></tr>

  <!-- FOOTER -->
  <tr>
    <td style="padding:28px 40px 24px;border-top:1px solid rgba(26,42,108,0.07);background:#F7F8FC;">
      <p style="margin:0 0 16px;font-size:10px;font-weight:300;color:#9AA3B8;line-height:1.7;font-family:Arial,Helvetica,sans-serif;text-align:justify;">
        Clara Ramalho é aderente ao código ANBIMA de regulação e melhores práticas para atividade de consultoria financeira. Os instrumentos financeiros discutidos, apresentados ou oferecidos neste material podem não ser adequados para todos os investidores. Esta comunicação não leva em consideração os objetivos de investimento, situação financeira ou necessidades específicas de qualquer investidor, não devendo servir como única fonte de informações no processo decisório do investidor que, antes de decidir, deverá realizar uma avaliação minuciosa do produto e respectivos riscos face a seus objetivos pessoais e à sua tolerância a risco (Suitability), preferencialmente por meio de profissional qualificado. Investimentos nos mercados financeiros e de capitais estão sujeitos a riscos de perda superior ao valor total do capital investido. O conteúdo apresentado não se trata de recomendação, indicação e/ou aconselhamento de investimento, sendo única e exclusiva responsabilidade do investidor a tomada de decisão. A rentabilidade obtida no passado não representa garantia de rentabilidade futura.
      </p>
      <hr style="border:none;border-top:1px solid rgba(26,42,108,0.08);margin:0 0 16px;" />
      <p style="margin:0 0 4px;font-size:10px;font-weight:300;color:#9AA3B8;text-align:center;font-family:Arial,Helvetica,sans-serif;">© 2026 Clara Ramalho · Consultoria Financeira Independente · Rio de Janeiro, RJ</p>
      <p style="margin:0 0 12px;font-size:10px;font-weight:300;color:#9AA3B8;text-align:center;font-family:Arial,Helvetica,sans-serif;">
        <a href="https://clararamalho.com.br" style="color:#9AA3B8;text-decoration:none;">clararamalho.com.br</a>
      </p>
      <p style="margin:0;font-size:10px;font-weight:300;color:#9AA3B8;text-align:center;font-family:Arial,Helvetica,sans-serif;">
        <a href="https://clararamalho.com.br/descadastrar.html" style="color:#9AA3B8;text-decoration:underline;text-underline-offset:2px;">Descadastrar</a>
        &nbsp;·&nbsp;
        <a href="https://clararamalho.com.br/politica-de-privacidade.html" style="color:#9AA3B8;text-decoration:underline;text-underline-offset:2px;">Política de Privacidade</a>
      </p>
    </td>
  </tr>

  <!-- ACCENT BOTTOM -->
  <tr><td style="height:3px;background:linear-gradient(90deg,#00C0C8 0%,#1A2A6C 100%);"></td></tr>

</table>
</body>
</html>`;

// ── Salva o arquivo .html ─────────────────────────────────────────────────
const output = input.replace(/\.md$/, ".html");
fs.writeFileSync(output, html, "utf-8");
console.log(`✅ Gerado: ${output}`);
