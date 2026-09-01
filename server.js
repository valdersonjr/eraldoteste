// ---------------------------------------------------------------------------
// Servidor de arquivos estáticos, sem nenhuma dependência externa.
//
// O jogo em si roda no navegador (dentro de um <canvas>). O papel do Node aqui
// e entregar os arquivos da pasta public/ para o browser. Mais tarde, se você
// quiser ranking ou multiplayer, e neste arquivo que essa lógica entra.
// ---------------------------------------------------------------------------

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const PORTA = process.env.PORT ?? 3000;

// Em serverless (Vercel) o arquivo pode ser executado a partir de um diretório
// diferente do que ele ocupa no repositório, então testamos os dois candidatos
// e ficamos com o primeiro que realmente contém o index.html.
const CANDIDATOS = [
  path.join(import.meta.dirname, 'public'),
  path.join(process.cwd(), 'public'),
];
const RAIZ = CANDIDATOS.find((dir) => existsSync(path.join(dir, 'index.html'))) ?? CANDIDATOS[0];

// O browser precisa saber "o que" ele esta recebendo. Sem o Content-Type certo,
// ele se recusa a executar os módulos JavaScript.
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pedido = url.pathname === '/' ? '/index.html' : url.pathname;

  // Resolve o caminho e garante que ninguem escape da pasta public/
  // usando algo como GET /../../etc/passwd
  const arquivo = path.normalize(path.join(RAIZ, decodeURIComponent(pedido)));
  if (!arquivo.startsWith(RAIZ)) {
    res.writeHead(403).end('Proibido');
    return;
  }

  try {
    const conteudo = await readFile(arquivo);
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] ?? 'application/octet-stream' });
    res.end(conteudo);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`404 - não encontrado\nprocurado: ${arquivo}\nraiz: ${RAIZ}`);
  }
});

servidor.listen(PORTA, () => {
  console.log(`Lunar Lander rodando em http://localhost:${PORTA}`);
});
