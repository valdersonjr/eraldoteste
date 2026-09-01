// ---------------------------------------------------------------------------
// Desenho. Este arquivo LE o estado do jogo e nunca o modifica.
//
// Vale a pena manter essa regra: quando o desenho e "só uma foto" do estado,
// você pode mudar o visual inteiro sem risco de quebrar a jogabilidade.
// ---------------------------------------------------------------------------

import { ESCALA, MUNDO, NAVE, POUSO } from './config.js';
import { alturaDoTerreno } from './terrain.js';
import { normalizarAngulo } from './lander.js';

const VERDE = '#7cff9e';
const VERMELHO = '#ff6b6b';
const TINTA = '#cfd6e4';

// Estrelas de fundo: sorteadas uma vez só, quando o módulo carrega.
const estrelas = Array.from({ length: 90 }, () => ({
  x: Math.random() * MUNDO.largura,
  y: Math.random() * MUNDO.altura * 0.75,
  brilho: 0.25 + Math.random() * 0.6,
}));

/**
 * Prepara o canvas. O detalhe importante e o devicePixelRatio: em telas
 * retina, 1 pixel de CSS vale 2 (ou mais) pixels reais. Sem esse ajuste o
 * desenho fica borrado.
 */
export function configurarCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;

  canvas.width = MUNDO.largura * dpr;
  canvas.height = MUNDO.altura * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr); // a partir daqui desenhamos em coordenadas do MUNDO

  return ctx;
}

export function desenhar(ctx, jogo) {
  ctx.fillStyle = '#04050a';
  ctx.fillRect(0, 0, MUNDO.largura, MUNDO.altura);

  desenharEstrelas(ctx);
  desenharTerreno(ctx, jogo.terreno);
  desenharParticulas(ctx, jogo.particulas);

  if (jogo.estado !== 'explodiu') desenharNave(ctx, jogo.nave);

  desenharHUD(ctx, jogo);
  desenharMensagem(ctx, jogo);
}

function desenharEstrelas(ctx) {
  for (const estrela of estrelas) {
    ctx.fillStyle = `rgba(255, 255, 255, ${estrela.brilho})`;
    ctx.fillRect(estrela.x, estrela.y, 1.5, 1.5);
  }
}

function desenharTerreno(ctx, terreno) {
  // Contorno do chao, fechado até a base da tela para poder preencher.
  ctx.beginPath();
  ctx.moveTo(terreno.pontos[0].x, terreno.pontos[0].y);
  for (const ponto of terreno.pontos) ctx.lineTo(ponto.x, ponto.y);
  ctx.lineTo(MUNDO.largura, MUNDO.altura);
  ctx.lineTo(0, MUNDO.altura);
  ctx.closePath();

  ctx.fillStyle = '#12151f';
  ctx.fill();
  ctx.strokeStyle = '#8c96ad';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Plataformas: linha grossa e brilhante + o multiplicador de pontos.
  for (const plataforma of terreno.plataformas) {
    ctx.beginPath();
    ctx.moveTo(plataforma.x1, plataforma.y);
    ctx.lineTo(plataforma.x2, plataforma.y);
    ctx.strokeStyle = VERDE;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = VERDE;
    ctx.font = 'bold 12px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`x${plataforma.multiplicador}`, (plataforma.x1 + plataforma.x2) / 2, plataforma.y + 16);
  }
}

function desenharNave(ctx, nave) {
  const l = NAVE.largura / 2;
  const a = NAVE.altura / 2;

  ctx.save();
  // Levamos a "origem do desenho" até a nave e giramos o mundo junto com ela.
  // Assim o corpo da nave e desenhado sempre nas mesmas coordenadas locais.
  ctx.translate(nave.x, nave.y);
  ctx.rotate(nave.angulo);

  // Chama do motor, atrás do corpo, tremendo um pouco a cada quadro.
  if (nave.motorLigado) {
    ctx.beginPath();
    ctx.moveTo(-5, a / 3);
    ctx.lineTo(0, a / 3 + 9 + Math.random() * 12);
    ctx.lineTo(5, a / 3);
    ctx.closePath();
    ctx.fillStyle = Math.random() > 0.5 ? '#ffd166' : '#ff8c42';
    ctx.fill();
  }

  ctx.strokeStyle = TINTA;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';

  // Corpo
  ctx.beginPath();
  ctx.moveTo(0, -a);
  ctx.lineTo(l - 3, -a / 3);
  ctx.lineTo(l - 3, a / 3);
  ctx.lineTo(-(l - 3), a / 3);
  ctx.lineTo(-(l - 3), -a / 3);
  ctx.closePath();
  ctx.fillStyle = '#1b2030';
  ctx.fill();
  ctx.stroke();

  // Pernas e pés
  ctx.beginPath();
  ctx.moveTo(-(l - 3), a / 3);
  ctx.lineTo(-l, a);
  ctx.moveTo(l - 3, a / 3);
  ctx.lineTo(l, a);
  ctx.moveTo(-l - 3, a);
  ctx.lineTo(-l + 3, a);
  ctx.moveTo(l - 3, a);
  ctx.lineTo(l + 3, a);
  ctx.stroke();

  ctx.restore();
}

function desenharParticulas(ctx, particulas) {
  for (const p of particulas) {
    ctx.fillStyle = `rgba(255, ${140 + Math.floor(p.vida * 90)}, 80, ${Math.min(1, p.vida)})`;
    ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
  }
}

function desenharHUD(ctx, jogo) {
  const { nave, terreno } = jogo;

  // Altitude = distância entre os pés da nave e o chao logo abaixo dela.
  const altitude = Math.max(0, alturaDoTerreno(terreno, nave.x) - (nave.y + NAVE.altura / 2));
  const grausAngulo = normalizarAngulo(nave.angulo) * (180 / Math.PI);

  ctx.textAlign = 'left';
  ctx.font = '13px ui-monospace, monospace';

  linha(ctx, 16, 28, 'ALTITUDE', `${(altitude / ESCALA).toFixed(0)} m`, TINTA);
  linha(ctx, 16, 48, 'VEL VERT', `${(nave.vy / ESCALA).toFixed(1)} m/s`,
    Math.abs(nave.vy) <= POUSO.velVerticalMax ? VERDE : VERMELHO);
  linha(ctx, 16, 68, 'VEL HORIZ', `${(nave.vx / ESCALA).toFixed(1)} m/s`,
    Math.abs(nave.vx) <= POUSO.velHorizontalMax ? VERDE : VERMELHO);
  linha(ctx, 16, 88, 'ÂNGULO', `${grausAngulo.toFixed(0)}°`,
    Math.abs(normalizarAngulo(nave.angulo)) <= POUSO.anguloMax ? VERDE : VERMELHO);

  // Barra de combustível
  const largura = 120;
  const proporcao = nave.combustivel / NAVE.combustivelInicial;

  ctx.fillStyle = '#6b7488';
  ctx.fillText('COMBUSTÍVEL', 16, 116);
  ctx.strokeStyle = '#39415a';
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 124, largura, 10);
  ctx.fillStyle = proporcao > 0.25 ? VERDE : VERMELHO;
  ctx.fillRect(16, 124, largura * proporcao, 10);

  // Placar, alinhado a direita
  ctx.textAlign = 'right';
  ctx.fillStyle = '#6b7488';
  ctx.fillText('PONTOS', MUNDO.largura - 16, 28);
  ctx.fillStyle = TINTA;
  ctx.font = 'bold 20px ui-monospace, monospace';
  ctx.fillText(String(jogo.pontos), MUNDO.largura - 16, 52);
  ctx.font = '13px ui-monospace, monospace';
  ctx.fillStyle = '#6b7488';
  ctx.fillText(`tentativa ${jogo.tentativas}`, MUNDO.largura - 16, 72);
}

function linha(ctx, x, y, rotulo, valor, cor) {
  ctx.fillStyle = '#6b7488';
  ctx.fillText(rotulo, x, y);
  ctx.fillStyle = cor;
  ctx.fillText(valor, x + 96, y);
}

function desenharMensagem(ctx, jogo) {
  if (jogo.estado === 'voando') return;

  const pousou = jogo.estado === 'pousou';

  ctx.fillStyle = 'rgba(4, 5, 10, 0.72)';
  ctx.fillRect(0, MUNDO.altura / 2 - 70, MUNDO.largura, 140);

  ctx.textAlign = 'center';
  ctx.fillStyle = pousou ? VERDE : VERMELHO;
  ctx.font = 'bold 34px ui-monospace, monospace';
  ctx.fillText(pousou ? 'POUSO PERFEITO' : 'NAVE DESTRUÍDA', MUNDO.largura / 2, MUNDO.altura / 2 - 18);

  ctx.fillStyle = TINTA;
  ctx.font = '15px ui-monospace, monospace';
  ctx.fillText(jogo.mensagem, MUNDO.largura / 2, MUNDO.altura / 2 + 14);

  ctx.fillStyle = '#6b7488';
  ctx.font = '13px ui-monospace, monospace';
  ctx.fillText('pressione R para tentar de novo', MUNDO.largura / 2, MUNDO.altura / 2 + 46);
}
