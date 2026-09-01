// ---------------------------------------------------------------------------
// O coração do jogo: o loop e a máquina de estados.
//
// Um jogo e, no fundo, esta função repetida ~60 vezes por segundo:
//     ler entrada  ->  atualizar estado  ->  desenhar
// Tudo o mais e detalhe.
// ---------------------------------------------------------------------------

import { FISICA, NAVE } from './config.js';
import { iniciarInput, input } from './input.js';
import { criarTerreno } from './terrain.js';
import { criarNave, atualizarNave, verificarColisao } from './lander.js';
import { configurarCanvas, desenhar } from './render.js';

// Passo fixo de física: 1/60 de segundo.
// Por que fixo? Se a física usasse o tempo real de cada quadro, o jogo se
// comportaria diferente em um monitor de 60Hz e em um de 144Hz -- e quedas de
// desempenho fariam a nave atravessar o chao. Com passo fixo, a simulação e
// sempre a mesma; só a quantidade de passos por quadro varia.
const PASSO_FIXO = 1 / 60;

const canvas = document.getElementById('jogo');
const ctx = configurarCanvas(canvas);

const jogo = {
  estado: 'voando', // 'voando' | 'pousou' | 'explodiu'
  nave: criarNave(),
  terreno: criarTerreno(),
  particulas: [],
  mensagem: '',
  pontos: 0,
  tentativas: 1,
};

function reiniciar({ terrenoNovo }) {
  jogo.estado = 'voando';
  jogo.nave = criarNave();
  jogo.particulas = [];
  jogo.mensagem = '';
  jogo.tentativas += 1;
  if (terrenoNovo) jogo.terreno = criarTerreno();
}

// --- Atualizacao -----------------------------------------------------------

function atualizar(dt) {
  atualizarParticulas(dt);

  if (jogo.estado !== 'voando') return; // parado: só as partículas continuam

  atualizarNave(jogo.nave, input, dt);

  const colisao = verificarColisao(jogo.nave, jogo.terreno);
  if (colisao) resolverColisao(colisao);
}

function resolverColisao(colisao) {
  if (colisao.tipo === 'pouso') {
    const ganho = Math.round((100 + jogo.nave.combustivel * 4) * colisao.plataforma.multiplicador);

    jogo.estado = 'pousou';
    jogo.pontos += ganho;
    jogo.mensagem = `+${ganho} pontos  (x${colisao.plataforma.multiplicador} da plataforma, ${Math.round(jogo.nave.combustivel)} de combustível)`;

    // Assenta a nave visualmente em cima da plataforma.
    jogo.nave.y = colisao.plataforma.y - NAVE.altura / 2;
    jogo.nave.angulo = 0;
    jogo.nave.vx = 0;
    jogo.nave.vy = 0;
    jogo.nave.motorLigado = false;
    return;
  }

  jogo.estado = 'explodiu';
  jogo.mensagem = colisao.motivo;
  jogo.particulas = criarExplosao(jogo.nave.x, jogo.nave.y);
}

function criarExplosao(x, y) {
  return Array.from({ length: 70 }, () => {
    const angulo = Math.random() * Math.PI * 2;
    const velocidade = 30 + Math.random() * 170;

    return {
      x,
      y,
      vx: Math.cos(angulo) * velocidade,
      vy: Math.sin(angulo) * velocidade - 50,
      vida: 0.7 + Math.random() * 0.9,
    };
  });
}

function atualizarParticulas(dt) {
  for (const p of jogo.particulas) {
    p.vy += FISICA.gravidade * 2 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vida -= dt;
  }
  jogo.particulas = jogo.particulas.filter((p) => p.vida > 0);
}

// --- Loop ------------------------------------------------------------------

let ultimoInstante = performance.now();
let acumulador = 0;

function quadro(agora) {
  // Quanto tempo real passou desde o quadro anterior, em segundos.
  // O limite de 0.25s evita uma avalanche de passos quando a aba fica em
  // segundo plano e volta depois de muito tempo.
  const delta = Math.min((agora - ultimoInstante) / 1000, 0.25);
  ultimoInstante = agora;

  if (input.apertouAgora('reiniciar')) {
    reiniciar({ terrenoNovo: jogo.estado === 'pousou' });
  }

  // Guardamos o tempo em um "acumulador" e gastamos em fatias iguais.
  acumulador += delta;
  while (acumulador >= PASSO_FIXO) {
    atualizar(PASSO_FIXO);
    acumulador -= PASSO_FIXO;
  }

  desenhar(ctx, jogo);
  input.fimDoQuadro();

  requestAnimationFrame(quadro);
}

// Atalho de depuração: com o jogo aberto, abra o console do navegador e
// escreva `jogo.nave.combustivel = 999` ou `jogo.nave.vy = 0`. Ver o estado
// reagindo ao vivo ajuda muito a entender o que cada número faz.
window.jogo = jogo;

iniciarInput();
requestAnimationFrame(quadro);
