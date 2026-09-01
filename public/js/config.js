// ---------------------------------------------------------------------------
// TODOS os números que definem "como o jogo se sente" moram aqui.
// Este e o arquivo pra você mexer primeiro: mude um valor, recarregue a página
// e sinta a diferenca. E a forma mais rapida de entender a física.
// ---------------------------------------------------------------------------

// Tamanho do mundo, em pixels. O canvas usa exatamente essas medidas.
export const MUNDO = { largura: 960, altura: 600 };

// Quantos pixels valem 1 metro. Serve só para o HUD mostrar números
// que parecem de verdade ("12 m/s" em vez de "36 px/s").
export const ESCALA = 3;

export const FISICA = {
  gravidade: 20,          // px/s^2 puxando a nave para baixo, sempre
  empuxo: 46,             // px/s^2 que o motor aplica na direção do nariz
  velocidadeRotacao: 2.0, // radianos/s enquanto você segura esquerda/direita
  consumoCombustivel: 11, // unidades por segundo de motor ligado
};

export const NAVE = {
  tanque: 100, // capacidade; e a referência da barra de combustível no HUD
  largura: 20,
  altura: 24,
};

// Cada tentativa sorteia um começo diferente dentro destas faixas. E a mudança
// que mais muda o jogo: sem um início fixo, não da para decorar uma sequência
// de comandos -- você tem de ler os instrumentos e reagir ao que veio.
export const INICIO = {
  x: [120, MUNDO.largura - 120],
  y: [70, 150],
  // Módulo da deriva horizontal. A faixa nao inclui o zero de propósito:
  // nascer parado seria um começo de graça. O lado e sorteado à parte.
  velHorizontal: [12, 34],
  velVertical: [0, 14],
  angulo: [-0.35, 0.35], // radianos, ~20 graus para cada lado
  combustivel: [78, 100],
};

// Os asteroides vagam por uma faixa do céu e crescem em número a cada pouso.
export const ASTEROIDES = {
  base: 2,        // quantos no nível 1
  porNivel: 1,    // quantos entram a cada pouso bem-sucedido
  maximo: 8,      // teto, senao o céu fecha e vira sorte
  raio: [9, 20],
  velocidade: [18, 52],
  aceleracaoPorNivel: 0.08, // +8% de velocidade por nível
  // Faixa vertical onde eles ficam, em fração da altura do mundo. O limite de
  // baixo deixa o corredor final de pouso livre: morrer a 5 px da plataforma
  // por causa de uma pedra e frustrante, não difícil.
  faixaY: [0.1, 0.62],
  // Folga mínima acima do pico mais alto do relevo. Sem ela, um terreno com
  // montanhas altas teria asteroides ricocheteando dentro da rocha.
  folgaDoTerreno: 45,
  // Raio livre em volta da nave no sorteio inicial. Nascer em cima dela seria
  // uma morte que o jogador não teve como evitar.
  distanciaSegura: 170,
};

// Os limites que separam um pouso de uma explosão.
export const POUSO = {
  velVerticalMax: 30,   // px/s
  velHorizontalMax: 18, // px/s
  anguloMax: 0.20,      // radianos (~11 graus)
};
