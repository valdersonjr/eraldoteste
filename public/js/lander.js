// ---------------------------------------------------------------------------
// A nave: estado + física.
//
// Este arquivo não desenha nada e não le teclado. Ele só recebe "quais acoes
// estao ativas" e "quanto tempo passou", e atualiza números. Manter física,
// entrada e desenho separados e o que impede um jogo de virar espaguete.
// ---------------------------------------------------------------------------

import { FISICA, MUNDO, NAVE, POUSO } from './config.js';
import { alturaDoTerreno, plataformaEm } from './terrain.js';

export function criarNave() {
  return {
    x: NAVE.inicio.x,
    y: NAVE.inicio.y,
    vx: NAVE.inicio.vx,       // velocidade horizontal, px/s
    vy: NAVE.inicio.vy,       // velocidade vertical, px/s (positivo = descendo)
    angulo: 0,                // radianos; 0 = nariz apontando para cima
    combustivel: NAVE.combustivelInicial,
    motorLigado: false,
  };
}

/**
 * Avanca a física em `dt` segundos.
 *
 * O metodo e a integração de Euler semi-implicita: primeiro atualiza a
 * velocidade com as acelerações, depois usa a velocidade nova para mover a
 * posição. E uma linha a mais de cuidado que evita a nave "ganhar energia"
 * sozinha ao longo do tempo.
 */
export function atualizarNave(nave, input, dt) {
  // 1. Rotacao -- controle direto, sem inércia angular (como no arcade original)
  if (input.segurando('girarEsquerda')) nave.angulo -= FISICA.velocidadeRotacao * dt;
  if (input.segurando('girarDireita')) nave.angulo += FISICA.velocidadeRotacao * dt;

  // 2. Empuxo do motor, na direção para onde o nariz aponta.
  //    Com ângulo 0 o nariz e o vetor (0, -1); girando por `ângulo` ele vira
  //    (sen a, -cos a). Por isso o seno vai no X e o cosseno (negativo) no Y.
  nave.motorLigado = input.segurando('empuxo') && nave.combustivel > 0;

  if (nave.motorLigado) {
    nave.vx += Math.sin(nave.angulo) * FISICA.empuxo * dt;
    nave.vy -= Math.cos(nave.angulo) * FISICA.empuxo * dt;
    nave.combustivel = Math.max(0, nave.combustivel - FISICA.consumoCombustivel * dt);
  }

  // 3. Gravidade: sempre para baixo, não importa a rotação da nave.
  nave.vy += FISICA.gravidade * dt;

  // 4. So agora a posição muda.
  nave.x += nave.vx * dt;
  nave.y += nave.vy * dt;

  // Sair por uma borda te traz de volta pela outra.
  if (nave.x < 0) nave.x += MUNDO.largura;
  if (nave.x > MUNDO.largura) nave.x -= MUNDO.largura;

  // Teto invisível, para não perder a nave fora da tela.
  if (nave.y < NAVE.altura) {
    nave.y = NAVE.altura;
    nave.vy = Math.max(0, nave.vy);
  }
}

/**
 * Converte um ponto do "espaço da nave" para o espaço do mundo, aplicando a
 * rotação. E exatamente a mesma matriz que o canvas usa em ctx.rotate().
 */
export function paraMundo(nave, lx, ly) {
  const sen = Math.sin(nave.angulo);
  const cos = Math.cos(nave.angulo);

  return {
    x: nave.x + lx * cos - ly * sen,
    y: nave.y + lx * sen + ly * cos,
  };
}

/** Os três pontos que importam para colisão: as duas pernas e o nariz. */
export function pontosDeColisao(nave) {
  const metadeL = NAVE.largura / 2;
  const metadeA = NAVE.altura / 2;

  return {
    pernaEsq: paraMundo(nave, -metadeL, metadeA),
    pernaDir: paraMundo(nave, metadeL, metadeA),
    nariz: paraMundo(nave, 0, -metadeA),
  };
}

/** Traz qualquer ângulo para a faixa -PI..PI, para poder comparar com o limite. */
export function normalizarAngulo(a) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

/**
 * A nave encostou no chao? Se sim, foi pouso ou batida?
 * Devolve null enquanto ela estiver no ar.
 *
 * Esta função e "pura": só olha nave + terreno e devolve um resultado. Nao
 * muda nada. Isso a torna fácil de testar sem abrir o navegador.
 */
export function verificarColisao(nave, terreno) {
  const pontos = pontosDeColisao(nave);
  const encostou = Object.values(pontos).some((p) => p.y >= alturaDoTerreno(terreno, p.x));
  if (!encostou) return null;

  const narizEncostou = pontos.nariz.y >= alturaDoTerreno(terreno, pontos.nariz.x);

  // As duas pernas precisam estar sobre a mesma área plana.
  const noPad = plataformaEm(terreno, pontos.pernaEsq.x) && plataformaEm(terreno, pontos.pernaDir.x);
  const plataforma = noPad ? plataformaEm(terreno, nave.x) : null;

  const descidaSuave = Math.abs(nave.vy) <= POUSO.velVerticalMax;
  const semDeriva = Math.abs(nave.vx) <= POUSO.velHorizontalMax;
  const nivelada = Math.abs(normalizarAngulo(nave.angulo)) <= POUSO.anguloMax;

  if (plataforma && !narizEncostou && descidaSuave && semDeriva && nivelada) {
    return { tipo: 'pouso', plataforma };
  }

  // Falhou: explica o porque. Saber o motivo e o que faz o jogador melhorar.
  let motivo = 'Você bateu no relevo, fora da plataforma.';
  if (plataforma && !descidaSuave) motivo = 'Desceu rápido demais.';
  else if (plataforma && !semDeriva) motivo = 'Ainda estava derivando de lado.';
  else if (plataforma && (!nivelada || narizEncostou)) motivo = 'A nave não estava nivelada.';

  return { tipo: 'crash', motivo };
}
