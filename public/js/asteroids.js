// ---------------------------------------------------------------------------
// Asteroides: o obstáculo que se move.
//
// O terreno e um problema estático -- você olha, planeja, executa. Os
// asteroides mudam isso: a rota que era boa há dois segundos pode não ser mais.
// E o que transforma "descer devagar" em "descer devagar no momento certo".
//
// Mesma regra dos outros arquivos: aqui não se desenha nem se le entrada.
// ---------------------------------------------------------------------------

import { ASTEROIDES, MUNDO, NAVE } from './config.js';
import { entre, inteiroEntre } from './aleatorio.js';
import { pontosDeColisao } from './lander.js';

/** Quantos asteroides o nível pede. Cresce até o teto e para. */
export function quantidadeNoNivel(nivel) {
  return Math.min(ASTEROIDES.base + (nivel - 1) * ASTEROIDES.porNivel, ASTEROIDES.maximo);
}

/**
 * Sorteia os asteroides de uma tentativa. Recebe a nave para poder manter
 * distância dela no sorteio: um asteroide nascido em cima do jogador seria uma
 * morte impossível de evitar, e isso e injusto, não difícil.
 */
export function criarAsteroides(nivel, nave, terreno) {
  return Array.from({ length: quantidadeNoNivel(nivel) }, () => criarUm(nivel, nave, terreno));
}

function criarUm(nivel, nave, terreno) {
  const [topo, base] = faixaVertical(terreno);
  let x = 0;
  let y = 0;

  // Sorteia até cair longe da nave. O limite de tentativas existe porque um
  // "repita até dar certo" sem saída e um travamento esperando acontecer --
  // se o céu estiver apertado demais, aceitamos a última posição e seguimos.
  for (let tentativa = 0; tentativa < 24; tentativa++) {
    x = entre(0, MUNDO.largura);
    y = entre(topo, base);
    if (Math.hypot(x - nave.x, y - nave.y) >= ASTEROIDES.distanciaSegura) break;
  }

  const direcao = entre(0, Math.PI * 2);
  const velocidade = entre(...ASTEROIDES.velocidade) * (1 + (nivel - 1) * ASTEROIDES.aceleracaoPorNivel);

  return {
    x,
    y,
    vx: Math.cos(direcao) * velocidade,
    // Achatamos o componente vertical: um asteroide que sobe e desce muito sai
    // da faixa a toda hora e o ricochete fica nervoso. Deslizando na horizontal
    // ele atravessa a rota da nave, que e a graça.
    vy: Math.sin(direcao) * velocidade * 0.4,
    raio: entre(...ASTEROIDES.raio),
    angulo: entre(0, Math.PI * 2),
    velAngular: entre(-1.4, 1.4),
    // A silhueta: um raio por vértice, em fração do raio médio. Sorteada uma
    // vez e guardada, senao a pedra "ferveria" a cada quadro.
    forma: Array.from({ length: inteiroEntre(7, 10) }, () => entre(0.72, 1.25)),
  };
}

export function atualizarAsteroides(asteroides, terreno, dt) {
  const [topo, base] = faixaVertical(terreno);

  for (const a of asteroides) {
    a.x += a.vx * dt;
    a.y += a.vy * dt;
    a.angulo += a.velAngular * dt;

    // Na horizontal eles dao a volta pela outra borda, igual a nave.
    if (a.x < -a.raio) a.x = MUNDO.largura + a.raio;
    if (a.x > MUNDO.largura + a.raio) a.x = -a.raio;

    // Na vertical, ricocheteiam: e o que os prende na faixa do céu e mantem o
    // corredor final de pouso limpo.
    if (a.y < topo) {
      a.y = topo;
      a.vy = Math.abs(a.vy);
    }
    if (a.y > base) {
      a.y = base;
      a.vy = -Math.abs(a.vy);
    }
  }
}

/**
 * Devolve o asteroide que encostou na nave, ou null.
 *
 * Tratamos o asteroide como um círculo, ignorando os picos da silhueta. E uma
 * mentira de propósito e a favor do jogador: passar raspando por uma ponta
 * conta como escape.
 */
export function asteroideQueAtingiu(nave, asteroides) {
  const pontos = Object.values(pontosDeColisao(nave));

  for (const a of asteroides) {
    // O centro entra com o raio da nave junto: sem isso um asteroide pequeno
    // poderia passar pelo meio do corpo sem tocar nenhum dos três pontos.
    if (Math.hypot(nave.x - a.x, nave.y - a.y) <= a.raio + NAVE.largura / 2) return a;
    if (pontos.some((p) => Math.hypot(p.x - a.x, p.y - a.y) <= a.raio)) return a;
  }

  return null;
}

/**
 * A faixa do céu onde os asteroides vivem, em pixels.
 *
 * O limite de baixo não e fixo: ele acompanha o pico mais alto do relevo. Um
 * valor fixo funcionaria em um terreno plano e colocaria pedras ricocheteando
 * dentro da montanha no terreno seguinte -- e cada terreno e sorteado.
 */
function faixaVertical(terreno) {
  const [topo, base] = ASTEROIDES.faixaY.map((fracao) => MUNDO.altura * fracao);

  // Lembrando que Y cresce para baixo: o pico mais alto e o menor Y.
  const pico = Math.min(...terreno.pontos.map((ponto) => ponto.y));
  const limite = Math.min(base, pico - ASTEROIDES.folgaDoTerreno);

  // Um terreno muito alto poderia espremer a faixa até ela se inverter.
  return [topo, Math.max(limite, topo + 40)];
}
