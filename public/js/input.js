// ---------------------------------------------------------------------------
// Entrada: teclado e toque.
//
// Regra de ouro em jogos: NAO coloque lógica de jogo dentro do "keydown".
// O evento avisa que a tecla mudou de estado; o jogo pergunta, a cada quadro,
// quais teclas estao pressionadas AGORA. Isso mantem a física previsível.
//
// O dedo entra exatamente pela mesma porta: um botao da tela não conhece a
// física, ele só declara a mesma "acao" que a tecla dispararia. Por isso o
// main.js e o lander.js não precisam saber se você joga no teclado ou no
// celular.
// ---------------------------------------------------------------------------

// De tecla física (e.code) para uma "acao" do jogo. Trabalhar com acoes em vez
// de teclas deixa o resto do código legível e facilita remapear controles.
const MAPA = {
  ArrowUp: 'empuxo',
  KeyW: 'empuxo',
  Space: 'empuxo',
  ArrowLeft: 'girarEsquerda',
  KeyA: 'girarEsquerda',
  ArrowRight: 'girarDireita',
  KeyD: 'girarDireita',
  KeyR: 'reiniciar',
};

const segurando = new Set();      // acoes pressionadas neste instante
const apertadasAgora = new Set(); // acoes que comecaram neste quadro

export const input = {
  /** A acao esta sendo mantida pressionada? (motor, giro) */
  segurando: (acao) => segurando.has(acao),

  /** A acao acabou de ser apertada? (reiniciar, menu) */
  apertouAgora: (acao) => apertadasAgora.has(acao),

  /** O main.js chama isso no fim de cada quadro para zerar os "apertou agora". */
  fimDoQuadro() {
    apertadasAgora.clear();
  },
};

export function iniciarInput() {
  iniciarTeclado();
  iniciarToque();
}

// --- Teclado ---------------------------------------------------------------

function iniciarTeclado() {
  window.addEventListener('keydown', (evento) => {
    const acao = MAPA[evento.code];
    if (!acao) return;

    evento.preventDefault(); // impede a barra de espaço de rolar a página

    // evento.repeat e true quando o sistema operacional "repete" a tecla
    // segurada. Ignoramos, senao "apertouAgora" dispararia várias vezes.
    if (!evento.repeat) apertadasAgora.add(acao);
    segurando.add(acao);
  });

  window.addEventListener('keyup', (evento) => {
    const acao = MAPA[evento.code];
    if (acao) segurando.delete(acao);
  });

  // Se a janela perde o foco (alt-tab), as teclas ficariam "presas" para sempre.
  window.addEventListener('blur', soltarTudo);
}

// --- Toque -----------------------------------------------------------------

// Pousar exige girar e acelerar ao mesmo tempo, ou seja, dois dedos na tela ao
// mesmo tempo. Cada dedo e um "pointerId" diferente, e guardamos quais dedos
// seguram cada acao: assim levantar um dedo não cancela a acao que o outro
// ainda mantem pressionada.
const dedosPorAcao = new Map();

function iniciarToque() {
  for (const botao of document.querySelectorAll('[data-acao]')) {
    const acao = botao.dataset.acao;

    botao.addEventListener('pointerdown', (evento) => {
      evento.preventDefault(); // nada de seleção de texto ou clique fantasma
      pressionar(acao, evento.pointerId);

      // Com a captura, o pointerup chega neste botao mesmo que o dedo escorregue
      // para fora dele. Sem isso, o motor ficaria ligado para sempre depois de
      // um deslize -- o bug clássico de controle na tela.
      //
      // Ela vem DEPOIS de registrar a acao, e dentro de um try: e uma melhoria,
      // não uma pré-condição. Se o navegador recusar a captura, o botao ainda
      // precisa funcionar.
      try {
        botao.setPointerCapture(evento.pointerId);
      } catch {
        // sem captura; o pointercancel abaixo ainda solta a acao
      }
    });

    for (const nome of ['pointerup', 'pointercancel']) {
      botao.addEventListener(nome, (evento) => soltar(acao, evento.pointerId));
    }

    // O menu de "toque longo" abriria por cima do jogo durante um giro demorado.
    botao.addEventListener('contextmenu', (evento) => evento.preventDefault());
  }
}

function pressionar(acao, dedo) {
  const dedos = dedosPorAcao.get(acao) ?? new Set();

  if (dedos.size === 0) apertadasAgora.add(acao); // primeiro dedo = "apertou"
  dedos.add(dedo);
  dedosPorAcao.set(acao, dedos);

  segurando.add(acao);
}

function soltar(acao, dedo) {
  const dedos = dedosPorAcao.get(acao);
  if (!dedos) return;

  dedos.delete(dedo);
  if (dedos.size === 0) segurando.delete(acao);
}

function soltarTudo() {
  segurando.clear();
  dedosPorAcao.clear();
}
