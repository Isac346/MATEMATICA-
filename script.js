/* Aventura Matemática – 6º ano
   Missão 1: quiz visual | Missão 2: verdadeiro ou falso com tempo | Missão 3: jogo da memória */
const $ = (id) => document.getElementById(id);
const estado = { pontos: 0, vidas: 3, missao: 0, indice: 0, travado: false, timer: null };
const sorteia = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const embaralha = (v) => [...v].sort(() => Math.random() - 0.5);

/* ---------- Telas e placar ---------- */
function mostrarTela(id) {
  document.querySelectorAll('.tela').forEach((t) => t.classList.remove('ativa'));
  $(id).classList.add('ativa');
}
function atualizarPlacar() {
  $('pontos').textContent = estado.pontos;
  $('painel-vidas').textContent = '❤️'.repeat(estado.vidas) + '🖤'.repeat(3 - estado.vidas);
}
function reacao(emoji) {
  const f = $('feedback');
  f.textContent = emoji;
  f.classList.add('mostra');
  setTimeout(() => f.classList.remove('mostra'), 650);
}
function som(freq, dur = 0.15) {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)();
    const o = c.createOscillator(), g = c.createGain();
    o.frequency.value = freq; o.type = 'triangle'; g.gain.value = 0.08;
    o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur);
  } catch (e) { /* sem áudio, tudo bem */ }
}
function acertou(pts = 10) { estado.pontos += pts; som(740); reacao('🌟'); atualizarPlacar(); }
function errou() {
  estado.vidas--; som(200, 0.3); reacao('💥'); atualizarPlacar();
  return estado.vidas <= 0;
}

/* ---------- Fluxo do jogo ---------- */
function iniciarJogo() {
  Object.assign(estado, { pontos: 0, vidas: 3, missao: 1 });
  $('topo').hidden = false;
  atualizarPlacar();
  iniciarQuiz();
}
function proximaMissao() {
  estado.missao++;
  if (estado.missao === 2) iniciarVF();
  else if (estado.missao === 3) iniciarMemoria();
  else fimDeJogo(true);
}
function fimDeJogo(venceu) {
  clearInterval(estado.timer);
  $('topo').hidden = true;
  $('fim-mascote').textContent = venceu ? '🏠' : '😴';
  $('fim-titulo').textContent = venceu ? 'Bolt chegou em casa! 🎉' : 'Ops! O foguete ficou sem energia';
  const estrelas = !venceu ? 0 : estado.vidas === 3 ? 3 : estado.vidas === 2 ? 2 : 1;
  $('fim-estrelas').textContent = '⭐'.repeat(estrelas) + '☆'.repeat(3 - estrelas);
  $('fim-pontos').textContent = estado.pontos;
  mostrarTela('tela-fim');
}

/* ---------- Missão 1: Quiz visual ---------- */
const frutas = ['🍎', '🍌', '🍓', '⭐', '🚀', '🍪'];
function gerarQuiz() {
  const f = () => frutas[sorteia(0, frutas.length - 1)];
  const qs = [];
  let a = sorteia(2, 8), b = sorteia(2, 8);
  qs.push({ simb: f(), n1: a, op: '+', n2: b, r: a + b, txt: 'Quantos ao todo?' });
  a = sorteia(6, 12); b = sorteia(2, a - 1);
  qs.push({ simb: f(), n1: a, op: '−', n2: b, r: a - b, txt: 'Quantos sobram?' });
  a = sorteia(2, 5); b = sorteia(2, 5);
  qs.push({ simb: f(), n1: a, op: '×', n2: b, r: a * b, txt: `${a} grupos de ${b}. Quantos ao todo?`, grupos: true });
  b = sorteia(2, 5); a = b * sorteia(2, 5);
  qs.push({ simb: f(), n1: a, op: '÷', n2: b, r: a / b, txt: `Divida ${a} em ${b} grupos iguais. Quantos em cada?` });
  a = sorteia(3, 9) * 2;
  qs.push({ simb: '🍕', n1: a, op: '½', n2: 0, r: a / 2, txt: `Metade de ${a}?` });
  a = sorteia(11, 25); b = sorteia(11, 25);
  qs.push({ simb: '🔢', n1: a, op: '+', n2: b, r: a + b, txt: `${a} + ${b} = ?` });
  return qs;
}
function visualDe(q) {
  const m = (n) => q.simb.repeat(n);
  if (q.grupos) return Array(q.n1).fill(`<span>(${m(q.n2)})</span>`).join(' ');
  if (q.op === '½') return `${q.simb.repeat(Math.min(q.n1, 12))}`;
  if (q.simb === '🔢') return `<span>${q.n1}</span><span class="op">+</span><span>${q.n2}</span>`;
  if (q.op === '÷') return m(Math.min(q.n1, 20));
  return `${m(q.n1)}<span class="op">${q.op}</span>${q.op === '+' || q.op === '−' ? m(q.n2) : ''}`;
}
function opcoesDe(r) {
  const set = new Set([r]);
  while (set.size < 4) {
    const v = r + sorteia(-4, 4);
    if (v > 0) set.add(v);
  }
  return embaralha([...set]);
}
function iniciarQuiz() {
  estado.indice = 0; estado.quiz = gerarQuiz();
  $('missao-nome').textContent = 'Missão 1';
  mostrarTela('tela-quiz');
  mostrarPerguntaQuiz();
}
function mostrarPerguntaQuiz() {
  const q = estado.quiz[estado.indice];
  estado.travado = false;
  $('quiz-visual').innerHTML = visualDe(q);
  $('quiz-pergunta').textContent = q.txt;
  const box = $('quiz-opcoes');
  box.innerHTML = '';
  opcoesDe(q.r).forEach((v) => {
    const b = document.createElement('button');
    b.className = 'botao'; b.textContent = v;
    b.addEventListener('click', () => responderQuiz(b, v, q));
    box.appendChild(b);
  });
}
function responderQuiz(botao, valor, q) {
  if (estado.travado) return;
  estado.travado = true;
  const todos = [...$('quiz-opcoes').children];
  todos.forEach((b) => (b.disabled = true));
  let morreu = false;
  if (valor === q.r) { botao.classList.add('certo'); acertou(); }
  else {
    botao.classList.add('errado');
    todos.find((b) => Number(b.textContent) === q.r).classList.add('certo');
    morreu = errou();
  }
  setTimeout(() => {
    if (morreu) return fimDeJogo(false);
    estado.indice++;
    estado.indice < estado.quiz.length ? mostrarPerguntaQuiz() : proximaMissao();
  }, 1100);
}

/* ---------- Missão 2: Verdadeiro ou Falso ---------- */
const bancoVF = [
  ['7 × 8 = 56', true], ['9 × 6 = 56', false], ['15 é múltiplo de 5', true],
  ['12 é um número ímpar', false], ['Metade de 20 é 10', true], ['100 ÷ 4 = 20', false],
  ['3 × 3 × 3 = 27', true], ['O dobro de 15 é 25', false], ['18 + 27 = 45', true],
  ['50 − 18 = 42', false], ['7 é um número primo', true], ['1/2 é igual a 2/4', true],
  ['9 é número par', false], ['8 × 0 = 8', false], ['Triplo de 4 é 12', true],
];
const TEMPO_VF = 10;
function iniciarVF() {
  estado.indice = 0; estado.vf = embaralha(bancoVF).slice(0, 6);
  $('missao-nome').textContent = 'Missão 2';
  mostrarTela('tela-vf');
  mostrarPerguntaVF();
}
function mostrarPerguntaVF() {
  const [txt] = estado.vf[estado.indice];
  estado.travado = false;
  $('vf-pergunta').textContent = txt;
  const barra = $('vf-barra');
  let restante = TEMPO_VF;
  barra.style.transform = 'scaleX(1)'; barra.classList.remove('perigo');
  clearInterval(estado.timer);
  estado.timer = setInterval(() => {
    restante -= 0.1;
    barra.style.transform = `scaleX(${Math.max(restante / TEMPO_VF, 0)})`;
    barra.classList.toggle('perigo', restante < 4);
    if (restante <= 0) responderVF(null);
  }, 100);
}
function responderVF(escolha) {
  if (estado.travado) return;
  estado.travado = true;
  clearInterval(estado.timer);
  const certa = estado.vf[estado.indice][1];
  let morreu = false;
  if (escolha === certa) acertou(15); else morreu = errou();
  setTimeout(() => {
    if (morreu) return fimDeJogo(false);
    estado.indice++;
    estado.indice < estado.vf.length ? mostrarPerguntaVF() : proximaMissao();
  }, 900);
}

/* ---------- Missão 3: Memória (conta ↔ resultado) ---------- */
const paresMemoria = [['6 × 7', '42'], ['9 × 5', '45'], ['48 ÷ 6', '8'], ['25 + 38', '63'], ['½ de 18', '9'], ['8 × 8', '64'], ['11 × 4', '44'], ['15 + 15', '30']];
function iniciarMemoria() {
  $('missao-nome').textContent = 'Missão 3';
  const escolhidos = embaralha(paresMemoria.filter(([c]) => c !== '100 − 37')).slice(0, 6);
  const cartas = embaralha(escolhidos.flatMap(([c, r], i) => [{ id: i, t: c }, { id: i, t: r }]));
  const grade = $('grade-memoria');
  grade.innerHTML = '';
  estado.viradas = []; estado.acertos = 0; estado.totalPares = escolhidos.length;
  cartas.forEach((c) => {
    const b = document.createElement('button');
    b.className = 'carta'; b.dataset.id = c.id;
    b.innerHTML = `<span class="verso">❓</span><span class="frente">${c.t}</span>`;
    b.addEventListener('click', () => virarCarta(b));
    grade.appendChild(b);
  });
  mostrarTela('tela-memoria');
}
function virarCarta(b) {
  if (estado.travado || b.classList.contains('virada') || b.classList.contains('par')) return;
  b.classList.add('virada'); estado.viradas.push(b);
  if (estado.viradas.length < 2) return;
  const [a, c] = estado.viradas;
  estado.travado = true;
  if (a.dataset.id === c.dataset.id) {
    setTimeout(() => {
      a.classList.add('par'); c.classList.add('par');
      estado.viradas = []; estado.travado = false;
      acertou(20); estado.acertos++;
      if (estado.acertos === estado.totalPares) setTimeout(proximaMissao, 800);
    }, 400);
  } else {
    setTimeout(() => {
      a.classList.remove('virada'); c.classList.remove('virada');
      estado.viradas = []; estado.travado = false; som(260, 0.1);
    }, 900);
  }
}

/* ---------- Eventos ---------- */
$('btn-jogar').addEventListener('click', iniciarJogo);
$('btn-reiniciar').addEventListener('click', () => mostrarTela('tela-inicio'));
$('btn-verdade').addEventListener('click', () => responderVF(true));
$('btn-falso').addEventListener('click', () => responderVF(false));
