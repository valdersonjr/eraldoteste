// ---------------------------------------------------------------------------
// O terreno lunar.
//
// E só uma lista de pontos ligados por retas, espacados igualmente no eixo X.
// Como o espacamento e fixo, descobrir a altura do chao em qualquer X vira
// uma continha de índice + interpolacao -- barato o suficiente para rodar
// várias vezes por quadro.
// ---------------------------------------------------------------------------

import { MUNDO } from './config.js';

const PASSO = 30; // distância horizontal entre dois pontos do terreno

/**
 * Gera um terreno novo, com duas plataformas planas de pouso.
 * A estreita vale o dobro de pontos -- e o risco/recompensa do jogo.
 */
export function criarTerreno() {
  const total = Math.ceil(MUNDO.largura / PASSO);
  const alturas = [];
  let y = MUNDO.altura - 120;

  // Passeio aleatório: cada ponto sobe ou desce um pouco em relacao ao anterior.
  // Simples assim, e já parece uma montanha.
  for (let i = 0; i <= total; i++) {
    alturas.push(y);
    y += (Math.random() - 0.5) * 80;
    y = limitar(y, MUNDO.altura * 0.5, MUNDO.altura - 40);
  }

  const meio = Math.floor(total / 2);
  const plataformas = [
    achatar(alturas, inteiroAleatorio(2, meio - 6), 4, 1),      // larga, x1
    achatar(alturas, inteiroAleatorio(meio + 2, total - 4), 2, 2), // estreita, x2
  ];

  return {
    pontos: alturas.map((altura, i) => ({ x: i * PASSO, y: altura })),
    plataformas,
  };
}

/** Deixa um trecho do terreno perfeitamente plano e devolve a plataforma criada. */
function achatar(alturas, inicio, largura, multiplicador) {
  const y = alturas[inicio];
  for (let i = inicio; i <= inicio + largura; i++) alturas[i] = y;

  return {
    x1: inicio * PASSO,
    x2: (inicio + largura) * PASSO,
    y,
    multiplicador,
  };
}

/**
 * Altura do chao em uma coordenada X qualquer.
 * Acha o segmento de reta que contem esse X e interpola entre as pontas.
 */
export function alturaDoTerreno(terreno, x) {
  const ultimo = terreno.pontos.length - 2;
  const i = limitar(Math.floor(x / PASSO), 0, ultimo);
  const a = terreno.pontos[i];
  const b = terreno.pontos[i + 1];
  const t = limitar((x - a.x) / PASSO, 0, 1);

  return a.y + (b.y - a.y) * t; // interpolacao linear
}

/** Devolve a plataforma que existe embaixo desse X, ou undefined. */
export function plataformaEm(terreno, x) {
  return terreno.plataformas.find((p) => x >= p.x1 && x <= p.x2);
}

function limitar(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

function inteiroAleatorio(minimo, maximo) {
  return minimo + Math.floor(Math.random() * (maximo - minimo + 1));
}
