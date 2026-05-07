export interface Env {
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
  AUDIENCE_ID: string;
}

// ── Busca contatos da audiência no Resend ──────────────────────────────────
async function getContactsFromResend(env: Env): Promise<string[]> {
  const res = await fetch(
    `https://api.resend.com/audiences/${env.AUDIENCE_ID}/contacts`,
    {
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend contacts error ${res.status}: ${err}`);
  }

  const data: { data: { email: string; unsubscribed: boolean }[] } =
    await res.json();

  return data.data
    .filter((c) => !c.unsubscribed)
    .map((c) => c.email);
}

// ── Template HTML do e-mail ────────────────────────────────────────────────
function getEmailTemplate(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Feliz Dia das Mães · Clara Ramalho</title>
</head>
<body style="margin:0;padding:40px 16px;background:#F7F8FC;font-family:Arial,Helvetica,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid rgba(26,42,108,0.10);border-radius:10px;overflow:hidden;">

  <!-- TOPO ACCENT -->
  <tr>
    <td style="height:3px;background:linear-gradient(90deg,#1A2A6C 0%,#00C0C8 100%);"></td>
  </tr>

  <!-- HEADER -->
  <tr>
    <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(26,42,108,0.07);">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="font-size:14px;font-weight:500;color:#1A2A6C;letter-spacing:-0.01em;">Clara Ramalho</span>
            <span style="color:#00C0C8;">.</span>
          </td>
          <td align="right">
            <span style="font-size:11px;font-weight:400;color:#9AA3B8;letter-spacing:0.10em;text-transform:uppercase;">Consultoria Financeira</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- DATA BADGE -->
  <tr>
    <td style="padding:40px 40px 0;">
      <span style="display:inline-block;font-size:10px;font-weight:400;letter-spacing:0.14em;text-transform:uppercase;color:#9AA3B8;">
        09 de maio de 2026
      </span>
    </td>
  </tr>

  <!-- TÍTULO -->
  <tr>
    <td style="padding:12px 40px 0;">
      <h1 style="margin:0;font-size:26px;font-weight:300;color:#1A2A6C;line-height:1.25;letter-spacing:-0.03em;">
        Feliz Dia das Mães
      </h1>
    </td>
  </tr>

  <!-- DIVISOR CIANO -->
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
      <p style="margin:0 0 18px;font-size:15px;font-weight:300;line-height:1.85;color:#5A6785;">Olá,</p>
      <p style="margin:0 0 18px;font-size:15px;font-weight:300;line-height:1.85;color:#5A6785;">
        Neste Dia das Mães, eu quero celebrar todas as mulheres que cuidam, acolhem, organizam a vida e seguram tantas responsabilidades ao mesmo tempo. Que hoje você consiga, pelo menos por alguns momentos, ser também o centro do cuidado.
      </p>
      <p style="margin:0 0 18px;font-size:15px;font-weight:300;line-height:1.85;color:#5A6785;">
        Que seja um dia leve, com presença, afeto e a sensação de que cada esforço vale a pena. E que você se lembre de olhar com carinho não só para quem você ama, mas também para os seus próprios sonhos e planos.
      </p>
      <p style="margin:0;font-size:15px;font-weight:400;line-height:1.85;color:#1A2A6C;">
        Feliz Dia das Mães!
      </p>
    </td>
  </tr>

  <!-- ASSINATURA -->
  <tr>
    <td style="padding:32px 40px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"
        style="background:#F7F8FC;border:1px solid rgba(26,42,108,0.07);border-radius:8px;">
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 2px;font-size:12px;font-weight:400;color:#9AA3B8;letter-spacing:0.08em;text-transform:uppercase;">Com carinho,</p>
            <p style="margin:0;font-size:15px;font-weight:500;color:#1A2A6C;letter-spacing:-0.01em;">Clara Ramalho</p>
            <p style="margin:4px 0 0;font-size:12px;font-weight:300;color:#9AA3B8;">Consultora de Investimentos Independente</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- SPACER -->
  <tr><td style="height:40px;"></td></tr>

  <!-- FOOTER -->
  <tr>
    <td style="padding:24px 40px;border-top:1px solid rgba(26,42,108,0.07);background:#F7F8FC;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:300;color:#9AA3B8;line-height:1.6;">
        Você está recebendo este e-mail por ser assinante da newsletter de Clara Ramalho.
      </p>
      <p style="margin:0;font-size:11px;font-weight:300;color:#9AA3B8;">
        <a href="https://clararamalho.com.br/descadastrar.html" style="color:#9AA3B8;text-decoration:underline;text-underline-offset:2px;">Cancelar inscrição</a>
        &nbsp;·&nbsp;
        <a href="https://clararamalho.com.br" style="color:#9AA3B8;text-decoration:none;">clararamalho.com.br</a>
      </p>
    </td>
  </tr>

  <!-- BOTTOM ACCENT -->
  <tr>
    <td style="height:3px;background:linear-gradient(90deg,#00C0C8 0%,#1A2A6C 100%);"></td>
  </tr>

</table>
</body>
</html>`;
}

// ── Delay utilitário para respeitar rate limit ─────────────────────────────
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Envia e-mail para um contato via Resend ───────────────────────────────
async function sendMothersDayEmail(
  email: string,
  env: Env
): Promise<{ ok: boolean; email: string; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: [email],
        subject: "Feliz Dia das Mães 💙",
        html: getEmailTemplate(),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, email, error: err };
    }

    return { ok: true, email };
  } catch (err) {
    return { ok: false, email, error: String(err) };
  }
}

// ── Handler principal ──────────────────────────────────────────────────────
async function run(env: Env): Promise<{ sent: number; failed: number; errors: string[] }> {
  const contacts = await getContactsFromResend(env);
  console.log(`[mothers-day] ${contacts.length} contatos encontrados.`);

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const email of contacts) {
    const result = await sendMothersDayEmail(email, env);

    if (result.ok) {
      sent++;
      console.log(`[mothers-day] ✓ Enviado: ${email}`);
    } else {
      failed++;
      errors.push(`${email}: ${result.error}`);
      console.error(`[mothers-day] ✗ Falha: ${email} — ${result.error}`);
    }

    // Aguarda 200ms entre envios para respeitar o rate limit do Resend
    await delay(200);
  }

  return { sent, failed, errors };
}

// ── Export do Worker ───────────────────────────────────────────────────────
export default {
  // Disparado automaticamente pelo Cron Trigger (08h00 BRT = 11h00 UTC)
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      run(env).then((r) =>
        console.log(
          `[mothers-day] Concluído — enviados: ${r.sent}, falhas: ${r.failed}`
        )
      )
    );
  },

  // Disparado manualmente via GET /test (para validar antes do dia)
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/test") {
      try {
        const result = await run(env);
        return new Response(JSON.stringify(result, null, 2), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Mothers Day Worker — OK", { status: 200 });
  },
};
