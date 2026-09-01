// ---------------------------------------------------------------------------
// Teclado.
//
// Regra de ouro em jogos: NAO coloque lógica de jogo dentro do "keydown".
// O evento avisa que a tecla mudou de estado; o jogo pergunta, a cada quadro,
// quais teclas estao pressionadas AGORA. Isso mantem a física previsível.
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
  window.addEventListener('blur', () => segurando.clear());
}
