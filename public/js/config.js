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
  combustivelInicial: 100,
  largura: 20,
  altura: 24,
  // De onde a nave comeca. O vx inicial e de propósito: você já nasce
  // derivando para a direita e precisa corrigir.
  inicio: { x: 320, y: 90, vx: 20, vy: 0 },
};

// Os limites que separam um pouso de uma explosão.
export const POUSO = {
  velVerticalMax: 30,   // px/s
  velHorizontalMax: 18, // px/s
  anguloMax: 0.20,      // radianos (~11 graus)
};
