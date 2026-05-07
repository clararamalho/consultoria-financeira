// Modais e formulários

const WORKER = 'https://formulario-contato.m-clarard.workers.dev';
const NL_WORKER = 'https://newsletter-cadastro.m-clarard.workers.dev';

function abrirModal(t) {
  document.getElementById('modal-' + t).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function fecharModal(t) {
  document.getElementById('modal-' + t).classList.remove('open');
  document.body.style.overflow = '';
}
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) { o.classList.remove('open'); document.body.style.overflow = ''; } });
});

const PRE = { planejamento: 'pf', patrimonial: 'op', investimentos: 'ei', educacao: 'ef' };
const TIT = { contato: 'Contato', planejamento: 'Planejamento Financeiro', patrimonial: 'Organização Patrimonial', investimentos: 'Estratégia de Investimentos', educacao: 'Educação Financeira' };
const QTD = { planejamento: 10, patrimonial: 8, investimentos: 8, educacao: 8 };

async function enviarFormulario(tipo) {
  const btn = document.querySelector('#form-' + tipo + ' .btn-enviar');
  btn.disabled = true; btn.textContent = 'Enviando...';
  let payload;
  if (tipo === 'contato') {
    const nome  = document.getElementById('ct-nome').value.trim();
    const email = document.getElementById('ct-email').value.trim();
    if (!nome || !email) { alert('Por favor, preencha nome e e-mail.'); btn.disabled = false; btn.textContent = 'Enviar'; return; }
    payload = { tipo: TIT[tipo], nome, sobrenome: document.getElementById('ct-sob').value.trim(), email, telefone: document.getElementById('ct-tel').value.trim(), respostas: { mensagem: document.getElementById('ct-msg').value.trim() } };
  } else {
    const p = PRE[tipo];
    const nome  = document.getElementById(p + '-nome').value.trim();
    const email = document.getElementById(p + '-email').value.trim();
    if (!nome || !email) { alert('Por favor, preencha nome e e-mail.'); btn.disabled = false; btn.textContent = 'Enviar'; return; }
    const respostas = {};
    for (let i = 1; i <= QTD[tipo]; i++) { const el = document.getElementById(p + '-q' + i); if (el) respostas['q' + i] = el.value.trim(); }
    payload = { tipo: TIT[tipo], nome, sobrenome: document.getElementById(p + '-sob').value.trim(), email, telefone: document.getElementById(p + '-tel').value.trim(), respostas };
  }
  try {
    const r = await fetch(WORKER, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (r.ok) { document.getElementById('form-' + tipo).style.display = 'none'; document.getElementById('ok-' + tipo).style.display = 'block'; }
    else throw new Error();
  } catch { alert('Erro ao enviar. Tente novamente.'); btn.disabled = false; btn.textContent = 'Enviar'; }
}

async function cadastrarNewsletter() {
  const email = document.getElementById('nlEmail').value.trim();
  if (!email) { alert('Por favor, informe seu e-mail.'); return; }
  const btn = document.querySelector('#nlForm button');
  btn.disabled = true; btn.textContent = 'Enviando...';
  try {
    const r = await fetch(NL_WORKER, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    if (r.ok) { document.getElementById('nlForm').style.display = 'none'; document.getElementById('nlSucesso').style.display = 'block'; }
    else throw new Error();
  } catch { alert('Erro ao cadastrar. Tente novamente.'); btn.disabled = false; btn.textContent = 'Quero receber'; }
}
