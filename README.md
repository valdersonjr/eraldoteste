# Lunar Lander

Jogo estilo *Lunar Lander* feito com Node puro — **zero dependências**, nenhum
`npm install`. Projeto de estudo: o objetivo é entender como um jogo funciona
por dentro, não usar uma engine.

## Rodar

```bash
npm start
# abra http://localhost:3000
```

Controles: `←` `→` giram · `↑` ou `espaço` liga o motor · `R` reinicia.

No celular, os mesmos comandos aparecem como botões na tela — eles surgem
sozinhos em aparelhos sem mouse e somem no computador. Dá para segurar o motor
e girar ao mesmo tempo, com dois dedos.

## O que muda a cada tentativa

Nada começa igual: posição, deriva, inclinação e combustível iniciais são
sorteados, além do terreno e das plataformas. E há asteroides vagando pelo céu
— cada pouso bem-sucedido sobe o nível e traz mais um, até o teto.

As faixas de sorteio ficam todas em `js/config.js` (`INICIO` e `ASTEROIDES`).
Mexer nelas é a forma mais rápida de deixar o jogo mais fácil ou mais cruel.

## Como está dividido

O Node aqui só serve arquivos; o jogo roda no navegador, dentro de um `<canvas>`.

```
server.js            servidor HTTP de arquivos estáticos (node:http + node:fs)
public/
  index.html         a página: um <canvas> e o script de entrada
  style.css          visual da página em volta do jogo
  js/
    aleatorio.js     sorteios que afetam a jogabilidade
    asteroids.js     as pedras: sorteio, movimento e colisão com a nave
    config.js        TODOS os números do jogo (gravidade, empuxo, limites)
    input.js         teclado e toque -> "ações" (empuxo, girarEsquerda, ...)
    terrain.js       gera o relevo e as plataformas; diz a altura do chão em X
    lander.js        estado e física da nave + regra de pouso/batida
    render.js        desenha tudo no canvas (só lê o estado, nunca muda)
    main.js          o loop e a máquina de estados; costura as peças
```

A separação é proposital: **entrada**, **simulação** e **desenho** são coisas
diferentes. Enquanto elas não se misturam, o jogo continua fácil de mexer.

## As três ideias que sustentam tudo

**1. O loop.** `requestAnimationFrame` chama uma função ~60x por segundo. Cada
chamada faz sempre o mesmo: lê a entrada, atualiza o estado, desenha.

**2. Passo fixo de física.** A física avança sempre em fatias de `1/60` de
segundo, guardadas num acumulador (`main.js`). Sem isso, o jogo se comportaria
diferente em um monitor de 144Hz e a nave atravessaria o chão em quedas de
desempenho.

**3. Integração de Euler semi-implícita.** Em `lander.js`: primeiro a velocidade
muda com as acelerações, *depois* a posição muda com a velocidade nova. A ordem
importa — invertida, a nave ganha energia sozinha com o tempo.

## Por onde começar a mexer

Abra `config.js` e mude um número por vez:

- `gravidade` para 8 — pouso tranquilo, quase sem desafio.
- `empuxo` para 25 — o motor mal segura a nave. Sinta a diferença.
- `POUSO.velVerticalMax` para 12 — só pouso muito suave conta.

Com o jogo aberto, o console do navegador também funciona:
`jogo.nave.combustivel = 999`, `jogo.nave.vy = 0`, `jogo.pontos = 100`.

## Exercícios, do mais fácil ao mais difícil

1. Mostrar no HUD quantos pousos você já fez.
2. Somar um bônus de pontos por pousar com muito combustível sobrando.
3. Fazer o combustível acabar de vez: sem combustível, sem giro também.
4. Rebater a nave no chão quando ela toca de leve, em vez de explodir.
5. Uma câmera que segue a nave, com o mundo mais largo que a tela.
6. Fases: a cada pouso, gerar um terreno mais acidentado e com menos combustível.
7. Guardar o recorde no servidor (aí sim `server.js` ganha uma rota `POST`).
