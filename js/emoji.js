/* Emojis iguais em todo aparelho: troca cada emoji da tela pelo desenho Fluent Emoji
   (o mesmo estilo do Windows 11; Microsoft, licença MIT, veja emoji/LICENSE.txt).
   Os desenhos ficam em emoji/<código>.webp (desenhados em 512 px a partir do SVG oficial e reduzidos com suavização: bordas lisas em qualquer tela). Um observador converte tudo o que entra na
   tela, então o resto do jogo continua escrevendo emojis normalmente.
   Para usar um emoji novo, gere o .webp dele (256 px, fundo transparente) na pasta e acrescente o código abaixo. */
(function () {
  'use strict';
  const PASTA = 'emoji/', EXT = '.webp';
  const CODIGOS = '1f308 1f30a 1f30d 1f315 1f319 1f327 1f32c 1f333 1f33e 1f33f 1f347 1f351 1f35a 1f35e 1f36f 1f372 1f377 1f37d 1f381 1f389 1f3a1 1f3a3 1f3ac 1f3b3 1f3b5 1f3b6 1f3b8 1f3ba 1f3c1 1f3c3-200d-2642 1f3c6 1f3cd 1f3d6 1f3d9 1f3db 1f3dc 1f3df 1f3e0 1f3e8 1f3f9 1f3fa 1f402 1f40b 1f40d 1f40e 1f40f 1f410 1f411 1f413 1f418 1f41f 1f426 1f42b 1f437 1f438 1f440 1f451 1f45e 1f463 1f464 1f465 1f466 1f468 1f469 1f474 1f475 1f476 1f478 1f47c 1f487-200d-2642 1f48d 1f492 1f4a1 1f4a5 1f4a6 1f4a7 1f4aa 1f4ac 1f4b0 1f4b8 1f4c5 1f4c6 1f4ca 1f4cb 1f4cf 1f4d5 1f4d6 1f4d7 1f4d8 1f4d9 1f4dc 1f4e6 1f504 1f507 1f50a 1f50d 1f513 1f515 1f522 1f525 1f54a 1f54d 1f573 1f575 1f5e1 1f5e3 1f5ff 1f62d 1f62e 1f631 1f633 1f645 1f64c 1f64f 1f68c 1f697 1f6a2 1f6aa 1f6b6 1f6cf 1f6e1 1f6f6 1f917 1f91a 1f91d 1f92f 1f930 1f932 1f93a 1f957 1f95e 1f969 1f981 1f985 1f992 1f997 1f9c2 1f9cd 1f9cd-200d-2642 1f9d2 1f9d4 1f9d4-200d-2642 1f9e5 1f9e9 1f9f1 1f9fa 1f9fe 1fa94 1fa99 1fa9c 1fa9f 1faa2 1faa6 1faa8 1fab5 2194 23f3 2600 2601 2693 2694 2696 2699 26a1 26bd 26d3 26f0 26f5 26fa 2705 2708 2709 270b 270d 270f 271d 2728 274c 2753 2795 27a1 2b06 2b50 30-20e3 34-20e3'.split(' ');
  const tem = new Set(CODIGOS);
  /* expressão que acha os emojis conhecidos (o seletor de variação FE0F é opcional) */
  const fonte = CODIGOS.map(k => k.split('-').map(h => String.fromCodePoint(parseInt(h, 16))))
    .sort((a, b) => b.length - a.length)
    .map(cs => cs.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\uFE0F?').join(''))
    .join('|');
  const RE = new RegExp(fonte, 'gu');
  const codigo = s => [...s].map(c => c.codePointAt(0)).filter(c => c !== 0xFE0F).map(c => c.toString(16)).join('-');
  const SVGNS = 'http://www.w3.org/2000/svg', XLINK = 'http://www.w3.org/1999/xlink';
  const PULAR = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, OPTION: 1, TITLE: 1, CANVAS: 1 };

  const SIMBOLOS = /([▶◀⏭⏮⏯⏹⏸⏪⏩⬇⬅✔✖↕↩↪⌨©®™™✳✴❇‼⁉▪▫◻◼])(?![︎️])/g;
  /* o desenho Fluent tem uma folga em volta: 18% maior fica do tamanho do emoji do Windows */
  const ESCALA = 1.18;

  function img(e) {
    const i = document.createElement('img');
    i.className = 'emoji';
    i.alt = e;
    i.draggable = false;
    i.src = PASTA + codigo(e) + EXT;
    return i;
  }

  /* <text> de SVG com um emoji só vira <image> do mesmo tamanho, no mesmo lugar */
  function trocarTextoSvg(t) {
    const conteudo = t.textContent.trim();
    RE.lastIndex = 0;
    const m = RE.exec(conteudo);
    if (!m || m[0] !== conteudo) return;
    const fs = parseFloat(t.getAttribute('font-size')) || 16;
    const x = parseFloat(t.getAttribute('x')) || 0, y = parseFloat(t.getAttribute('y')) || 0;
    const ancora = t.getAttribute('text-anchor') || 'start';
    const im = document.createElementNS(SVGNS, 'image');
    const lado = fs * ESCALA;
    const x0 = ancora === 'middle' ? x - lado / 2 : ancora === 'end' ? x - lado : x;
    const base = t.getAttribute('dominant-baseline');
    const y0 = base === 'central' || base === 'middle' ? y - lado / 2 : y - lado * 0.85;
    im.setAttribute('x', x0); im.setAttribute('y', y0);
    im.setAttribute('width', lado); im.setAttribute('height', lado);
    const url = PASTA + codigo(conteudo) + EXT;
    im.setAttribute('href', url);
    im.setAttributeNS(XLINK, 'xlink:href', url);
    ['transform', 'class', 'id', 'style', 'opacity'].forEach(a => { if (t.hasAttribute(a)) im.setAttribute(a, t.getAttribute(a)); });
    im.setAttribute('data-emoji', conteudo);
    t.replaceWith(im);
  }

  function trocarNoTexto(no) {
    const pai = no.parentNode;
    if (!pai || PULAR[pai.nodeName] || pai.isContentEditable) return;
    let s = no.nodeValue;
    /* símbolos de botão (▶ ◀ ⏭ ✔...): o iPhone desenha como emoji azul; o seletor
       de texto (FE0E) pede o símbolo simples, igual ao do computador */
    SIMBOLOS.lastIndex = 0;
    if (SIMBOLOS.test(s)) { s = s.replace(SIMBOLOS, '$1︎'); no.nodeValue = s; }
    RE.lastIndex = 0;
    if (!RE.test(s)) return;
    if (pai.namespaceURI === SVGNS) { if (pai.nodeName === 'text') trocarTextoSvg(pai); return; }
    const frag = document.createDocumentFragment();
    let ultimo = 0;
    RE.lastIndex = 0;
    s.replace(RE, (e, pos) => {
      if (pos > ultimo) frag.appendChild(document.createTextNode(s.slice(ultimo, pos)));
      frag.appendChild(img(e));
      ultimo = pos + e.length;
      return e;
    });
    if (ultimo < s.length) frag.appendChild(document.createTextNode(s.slice(ultimo)));
    pai.replaceChild(frag, no);
  }

  function varrer(raiz) {
    if (raiz.nodeType === 3) { trocarNoTexto(raiz); return; }
    if (raiz.nodeType !== 1 || PULAR[raiz.nodeName]) return;
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    const nos = [];
    while (w.nextNode()) nos.push(w.currentNode);
    nos.forEach(trocarNoTexto);
  }

  /* depois que a página abre, baixa todos os desenhos aos poucos: assim nenhum emoji
     aparece "em branco" na primeira vez que surge (no celular, pela internet) */
  window.addEventListener('load', () => {
    const fila = CODIGOS.slice();
    const ocioso = window.requestIdleCallback || (f => setTimeout(f, 200));
    (function lote() {
      fila.splice(0, 12).forEach(k => { const i = new Image(); i.src = PASTA + k + EXT; });
      if (fila.length) ocioso(lote);
    })();
  });

  window.EMOJI = { varrer, tem: e => tem.has(codigo(e)), url: e => PASTA + codigo(e) + EXT };

  varrer(document.body);
  new MutationObserver(lista => {
    for (const m of lista) {
      if (m.type === 'characterData') trocarNoTexto(m.target);
      else m.addedNodes.forEach(varrer);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();
