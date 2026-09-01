// ---------------------------------------------------------------------------
// Os sorteios que mudam a jogabilidade.
//
// Aqui mora o acaso que decide uma partida: onde a nave nasce, com que deriva,
// quantas pedras e por onde. Concentrado assim, um dia da para trocar tudo por
// um gerador com semente e ter partidas reproduzíveis para depurar.
//
// O tremor da chama e o espalhamento das partículas continuam usando
// Math.random() no lugar onde sao desenhados: sao ruído visual, não decisões
// de jogo, e ninguém precisa reproduzi-los.
//
// As faixas do config.js sao pares [minimo, maximo], então a chamada fica
// `entre(...INICIO.y)` -- o número e o comentário moram no config, não aqui.
// ---------------------------------------------------------------------------

/** Um número real entre os dois extremos. */
export function entre(minimo, maximo) {
  return minimo + Math.random() * (maximo - minimo);
}

/** Um inteiro entre os dois extremos, ambos incluídos. */
export function inteiroEntre(minimo, maximo) {
  return minimo + Math.floor(Math.random() * (maximo - minimo + 1));
}

/** -1 ou 1, com a mesma chance. Serve para sortear "de que lado". */
export function sinal() {
  return Math.random() < 0.5 ? -1 : 1;
}
