/* ==========================================================================
   Quiz Bíblico da EBD: lógica do jogo
   ========================================================================== */
(function () {
  'use strict';

  const DADOS = window.QUIZ;
  const MODS = DADOS.modulos;
  const MOD = {};
  MODS.forEach(m => { MOD[m.id] = m; });
  const CHAVE = 'quiz-ebd-v1';

  const CORES = {
    carmesim: { nome: 'Carmesim', base: '#D7263D', escura: '#8E1426', texto: '#fff' },
    azul:     { nome: 'Azul',     base: '#2479D8', escura: '#124A8C', texto: '#fff' },
    ouro:     { nome: 'Ouro',     base: '#F4B731', escura: '#A9720A', texto: '#2A1A3E' },
    purpura:  { nome: 'Púrpura',  base: '#8E44C9', escura: '#55217F', texto: '#fff' },
    verde:    { nome: 'Verde',    base: '#3E9B4F', escura: '#245F2E', texto: '#fff' },
    laranja:  { nome: 'Laranja',  base: '#F07F2E', escura: '#A44C0E', texto: '#fff' }
  };
  const CORES_MOD = ['carmesim', 'ouro', 'azul', 'purpura'];
  const EMOJIS_TIME = ['🦁', '🐑', '🕊️', '🐟', '🔥', '⭐', '👑', '🍇', '🌿', '🐫', '🦅', '⚓', '🏹', '🎺', '📜', '🌾'];

  /* ícone de "sortear de novo": duas setas em círculo, na cor do texto do botão
     (mesmo estilo do ▶ do "Começar a rodada", igual no PC e no celular) */
  const ICO_SORTEAR = '<svg class="ico-svg" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M19.6 10.2A8 8 0 0 0 5.2 7.6M4.4 13.8a8 8 0 0 0 14.4 2.6" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>' +
    '<path d="M21.2 3.6v7.2h-7.2z M2.8 20.4v-7.2h7.2z" fill="currentColor"/></svg>';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const el = {
    placar: $('#placar'), palco: $('#palco'), bandeja: $('#bandeja'),
    sobre: $('#sobre'), avisos: $('#avisos')
  };

  /* ------------------------------------------------------------ utilidades */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function embaralhar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function fmtNum(v, max) {
    const a = Math.abs(v);
    const casas = max != null ? max : (a >= 100 ? 0 : a >= 10 ? 1 : 2);
    return v.toLocaleString('pt-BR', { maximumFractionDigits: casas });
  }
  function fmtInt(v) { return Math.round(v).toLocaleString('pt-BR'); }
  function fmtBRL(v) {
    if (v < 100 && Math.abs(v - Math.round(v)) > 0.004) {
      return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  }
  function fmtBRLCurto(v) {
    if (v >= 1e9) { const x = v / 1e9; return `R$ ${fmtNum(x, 1)} ${x >= 2 ? 'bilhões' : 'bilhão'}`; }
    if (v >= 1e6) { const x = v / 1e6; return `R$ ${fmtNum(x, 1)} ${x >= 2 ? 'milhões' : 'milhão'}`; }
    return fmtBRL(v);
  }
  function nomeUnidade(un, v) {
    if (un === 't') return v >= 2 ? 'toneladas' : 'tonelada';
    if (un === 'L') return 'litros';
    return un || '';
  }
  function fmtValor(v, un) {
    if (un === 'R$') return fmtBRLCurto(v);
    const u = nomeUnidade(un, v);
    return (fmtNum(v) + (u ? ' ' + u : '')).trim();
  }
  function fmtValorCompleto(v, un) {
    if (un === 'R$') return fmtBRL(v) + (v >= 1e6 ? ` (${fmtBRLCurto(v)})` : '');
    return fmtValor(v, un);
  }
  function fmtDenarios(d) {
    if (d < 1) return `1/${Math.round(1 / d)} de denário`;
    if (d === 1) return '1 denário';
    return `${fmtInt(d)} denários`;
  }
  function metade(v) { return Math.max(5, Math.round(v / 2 / 5) * 5); }

  /* Lê números como "30 mil", "2,5 milhões", "1.500", "6 bi", "1,56". */
  function lerNumero(txt) {
    if (txt == null) return NaN;
    let s = String(txt).toLowerCase().replace(/r\$/g, '').trim();
    if (!s) return NaN;
    let mult = 1;
    const m = s.match(/([a-zçãõéê]+)\.?$/);
    if (m) {
      const w = m[1];
      if (w.startsWith('tri')) mult = 1e12;
      else if (w.startsWith('bi')) mult = 1e9;
      else if (w.startsWith('milh') || w === 'mi' || w === 'mm') mult = 1e6;
      else if (w === 'mil' || w === 'k') mult = 1e3;
      s = s.slice(0, m.index).trim();
    }
    s = s.replace(/\s+/g, '');
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d*,\d+$/.test(s)) s = s.replace(',', '.');
    if (!/^\d*\.?\d+$/.test(s)) return NaN;
    const v = parseFloat(s);
    return isFinite(v) ? v * mult : NaN;
  }

  function normalizar(s) {
    return String(s).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ').trim()
      .replace(/^(o|a|os|as) /, '')
      .replace(/^(primeira|primeiro|1a|1o|i) /, '1 ')
      .replace(/^(segunda|segundo|2a|2o|ii) /, '2 ')
      .replace(/^(terceira|terceiro|3a|3o|iii) /, '3 ')
      .replace(/^([123])(?=[a-z])/, '$1 ');
  }
  function distancia(a, b, limite) {
    if (Math.abs(a.length - b.length) > limite) return limite + 1;
    let ant = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      let menor = i;
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(ant[j] + 1, cur[j - 1] + 1, ant[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (cur[j] < menor) menor = cur[j];
      }
      if (menor > limite) return limite + 1;
      ant = cur;
    }
    return ant[b.length];
  }

  /* ------------------------------------------------------------ estado */

  function estadoPadrao() {
    return {
      titulo: 'Quiz Bíblico da EBD',
      subtitulo: 'Encerramento ' + new Date().getFullYear(),
      times: [
        { nome: 'Leões de Judá', emoji: '🦁', cor: 'carmesim', pontos: 0, membros: [], jogaram: [] },
        { nome: 'Cordeiros', emoji: '🐑', cor: 'azul', pontos: 0, membros: [], jogaram: [] }
      ],
      jogadores: [null, null],
      vez: 0,
      usadas: {},
      ordem: {},
      /* salário mínimo de 2026 (Decreto 12.797/2025); 1 dia de trabalho = salário ÷ 30 */
      salario: 1621,
      tempo: 'normal',
      som: true,
      volume: 'alto',
      musica: 'media',
      trilha: 'moderna',
      historico: [],
      /* Aposta Final: rodadas já jogadas e os representantes sorteados em cada uma */
      finalRodada: 0,
      finalReps: [],
      finalTemas: [],
      emJogo: false
    };
  }
  function carregar() {
    try {
      const t = localStorage.getItem(CHAVE);
      if (t) {
        const s = Object.assign(estadoPadrao(), JSON.parse(t));
        if (Array.isArray(s.times) && s.times.length === 2) {
          s.times.forEach(t => { t.membros = t.membros || []; t.jogaram = t.jogaram || []; });
          if (!Array.isArray(s.jogadores)) s.jogadores = [null, null];
          return s;
        }
      }
    } catch (e) { /* armazenamento indisponível */ }
    return estadoPadrao();
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) { /* ignora */ }
  }
  let S = carregar();
  delete S.diaria;   /* versões antigas guardavam o dia de trabalho direto */
  /* valor diário do salário mínimo, como no decreto: mensal ÷ 30, arredondado para cima no centavo */
  const diariaDe = salario => Math.ceil(Math.round(salario / 30 * 1e6) / 1e4) / 100;
  function diaria() { return diariaDe(S.salario); }
  Som.ligado = S.som;
  Som.nivel = S.volume;
  Musica.nivel = S.musica;
  Musica.trilha = S.trilha;

  function novoJogo() {
    const manter = {
      titulo: S.titulo, subtitulo: S.subtitulo, salario: S.salario, tempo: S.tempo, som: S.som, volume: S.volume, musica: S.musica, trilha: S.trilha,
      times: S.times.map(t => ({ nome: t.nome, emoji: t.emoji, cor: t.cor, pontos: 0, membros: t.membros.slice(), jogaram: [] }))
    };
    S = Object.assign(estadoPadrao(), manter);
    salvar();
  }

  function garantirOrdem(id) {
    const n = MOD[id].perguntas.length;
    const o = S.ordem[id];
    if (!o || o.length !== n) S.ordem[id] = embaralhar([...Array(n).keys()]);
  }
  function restantes(id) {
    const n = MOD[id].perguntas.length;
    return n - (S.usadas[id] || []).filter(i => i < n).length;
  }
  function proximaPergunta(id) {
    garantirOrdem(id);
    const usadas = S.usadas[id] || [];
    for (const i of S.ordem[id]) if (!usadas.includes(i)) return i;
    return null;
  }
  function marcarUsada(id, idx) {
    S.usadas[id] = S.usadas[id] || [];
    if (!S.usadas[id].includes(idx)) S.usadas[id].push(idx);
    S.emJogo = true;
    salvar();
  }
  function classeCor(m) {
    const i = MODS.indexOf(m);
    return 'cor-' + CORES_MOD[(i + Math.floor(i / 4)) % 4];
  }
  function estiloTime(i) {
    const c = CORES[S.times[i].cor] || CORES.carmesim;
    return `--c:${c.base};--c-esc:${c.escura};--c-txt:${c.texto}`;
  }
  /* Desenho próprio (js/arte.js) quando existe; senão, o emoji. */
  function icone(arte, emoji, cls) {
    const a = arte && window.ARTE && window.ARTE[arte];
    return a ? `<img class="${cls || 'arte-mini'}" src="${a.url}" alt="">` : (emoji || '');
  }

  function nomeTime(i) { const t = S.times[i]; return `${t.emoji} ${esc(t.nome)}`; }

  /* ------------------------------------------------------------ integrantes e rodízio */

  function timesCompletos() { return S.times.every(t => t.membros.length > 0); }
  /* Nome de quem joga pelo time i nesta rodada (ou o nome do time, se não houver). */
  function quemJoga(i) {
    const t = S.times[i], j = S.jogadores && S.jogadores[i];
    return j ? `${t.emoji} ${esc(j)} (${esc(t.nome)})` : nomeTime(i);
  }
  function quemJogaCurto(i) {
    const t = S.times[i], j = S.jogadores && S.jogadores[i];
    return j ? `${t.emoji} ${esc(j)}` : nomeTime(i);
  }
  /* Sorteia alguém que ainda não jogou neste ciclo; quando todos jogaram, recomeça. */
  function sortearMembro(i, evitar) {
    const t = S.times[i];
    t.jogaram = t.jogaram.filter(n => t.membros.includes(n));
    let livres = t.membros.filter(n => !t.jogaram.includes(n));
    if (!livres.length) { t.jogaram = []; livres = t.membros.slice(); }
    if (evitar && livres.length > 1) livres = livres.filter(n => n !== evitar);
    const nome = livres[Math.floor(Math.random() * livres.length)];
    t.jogaram.push(nome);
    return nome;
  }
  function desfazerSorteio(i, nome) {
    const t = S.times[i];
    const k = t.jogaram.lastIndexOf(nome);
    if (k >= 0) t.jogaram.splice(k, 1);
  }

  /* ------------------------------------------------------------ teclado */

  let teclas = {};
  let teclasLocais = {};
  let teclasModal = {};
  let travaModal = false;

  function chaveDe(e) { return e.key.length === 1 ? e.key.toLowerCase() : e.key; }
  function rotuloTecla(t) { return { Enter: 'Enter', Escape: 'Esc', ' ': 'Espaço' }[t] || t.toUpperCase(); }

  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = chaveDe(e);
    const tag = e.target && e.target.tagName;
    const digitando = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

    if (!el.sobre.hidden) {
      if (k === 'Escape') { e.preventDefault(); if (!travaModal) fecharModal(); return; }
      if (digitando) return;
      if (teclasModal[k]) { e.preventDefault(); teclasModal[k](); }
      return;
    }
    if (digitando) { if (k === 'Escape') e.target.blur(); return; }
    if (tag === 'BUTTON' && (k === 'Enter' || k === ' ')) return;

    const bt = teclas[k];
    if (bt) { e.preventDefault(); if (!bt.disabled) bt.click(); return; }
    if (teclasLocais[k]) { e.preventDefault(); teclasLocais[k](e); return; }
    if (k === ' ' || k === 't') { if (Crono.total) { e.preventDefault(); Crono.alternar(); } return; }
    if (k === 'f') { telaCheia(); return; }
    if (k === 'n') { alternarMusica(); return; }
    if (k === '?') ajuda();
  });

  /* Depois de um clique com o mouse, tira o foco do botão
     para que as teclas de atalho continuem funcionando. */
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button');
    if (b && e.detail > 0) b.blur();
  });

  /* ------------------------------------------------------------ bandeja de botões */

  function bandeja(lista) {
    teclas = {};
    /* Lista vazia (durante o suspense): mantém os botões no lugar, só desativados,
       para o rodapé não sumir e a tela não pular. */
    if (!lista || !lista.filter(Boolean).length) {
      $$('button', el.bandeja).forEach(b => { b.disabled = true; });
      el.bandeja.classList.add('esperando');
      return;
    }
    el.bandeja.classList.remove('esperando');
    el.bandeja.innerHTML = '';
    (lista || []).forEach(b => {
      if (!b) return;
      if (b === '|') {
        const s = document.createElement('span');
        s.className = 'espaco';
        el.bandeja.appendChild(s);
        return;
      }
      const bt = document.createElement('button');
      bt.type = 'button';
      bt.className = 'btn ' + (b.cls || 'sutil');
      bt.innerHTML = (b.ico ? `<span class="ico" aria-hidden="true">${b.ico}</span>` : '') +
        (b.soIcone ? '' : `<span>${b.txt}</span>`) +
        (b.tecla ? `<kbd>${rotuloTecla(b.tecla)}</kbd>` : '');
      if (b.soIcone) { bt.title = b.txt; bt.setAttribute('aria-label', b.txt); }
      if (b.desativado) bt.disabled = true;
      if (b.id) bt.id = b.id;
      bt.addEventListener('click', () => { Som.clique(); b.fn(); });
      el.bandeja.appendChild(bt);
      if (b.tecla) teclas[b.tecla.length === 1 ? b.tecla.toLowerCase() : b.tecla] = bt;
    });
  }
  function bPular() { return { txt: 'Pular', ico: '⏭', fn: pular }; }
  /* Regra atual: cada equipe joga a sua própria pergunta, então não há "passar a vez". */
  function bPassar() { return null; }

  /* ------------------------------------------------------------ avisos e modais */

  function aviso(texto, ms) {
    const a = document.createElement('div');
    a.className = 'aviso';
    a.textContent = texto;
    el.avisos.appendChild(a);
    setTimeout(() => { a.classList.add('sai'); setTimeout(() => a.remove(), 320); }, ms || 2400);
  }
  /* aoFecharModal: o que fazer se a janela fechar sem terminar (ex.: desfazer um sorteio) */
  let aoFecharModal = null;
  function abrirModal(html) {
    el.sobre.innerHTML = html;
    el.sobre.hidden = false;
    teclasModal = {};
    travaModal = false;
  }
  function fecharModal() {
    const aoFechar = aoFecharModal;
    aoFecharModal = null;
    el.sobre.hidden = true;
    el.sobre.innerHTML = '';
    teclasModal = {};
    travaModal = false;
    if (aoFechar) aoFechar();
  }
  el.sobre.addEventListener('click', e => { if (e.target === el.sobre && !travaModal) fecharModal(); });

  function confirmar(msg, sim, rotuloSim) {
    abrirModal(`<div class="cartao modal" role="dialog" aria-modal="true">
      <h2>${msg}</h2>
      <div class="modal-acoes">
        <button class="btn sutil" id="m-nao">Cancelar</button>
        <button class="btn primario" id="m-sim">${rotuloSim || 'Sim'}</button>
      </div></div>`);
    $('#m-nao').onclick = fecharModal;
    $('#m-sim').onclick = () => { fecharModal(); sim(); };
    teclasModal.Enter = () => { fecharModal(); sim(); };
    $('#m-sim').focus();
  }

  function ajuda() {
    const linhas = [
      ['Enter', 'Ação principal (o botão dourado)'],
      ['R', 'Revelar a resposta'],
      ['A  M  E', 'Acertou, meio certo, errou'],
      ['D', 'Dica ou próxima pista'],
      ['1 a 4', 'Escolher uma opção'],
      ['T ou Espaço', 'Pausar ou continuar o cronômetro'],
      ['V', 'Trocar a vez (no painel)'],
      ['N', 'Ligar ou desligar a música de fundo'],
      ['F', 'Tela cheia'],
      ['Esc', 'Fechar janela ou pular cinemática'],
      ['Clique no placar', 'Corrigir pontos ou desfazer']
    ];
    abrirModal(`<div class="cartao modal" role="dialog" aria-modal="true">
      <h2>Atalhos para quem comanda</h2>
      <div class="atalhos">${linhas.map(([k, d]) => `<kbd>${k}</kbd><span>${d}</span>`).join('')}</div>
      <div class="modal-acoes"><button class="btn primario" id="m-ok">Entendi</button></div></div>`);
    $('#m-ok').onclick = fecharModal;
    teclasModal.Enter = fecharModal;
  }

  function telaCheia() {
    try {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    } catch (e) { aviso('Use F11 para tela cheia.'); }
  }
  function alternarSom() {
    S.som = !S.som;
    Som.ligado = S.som;
    salvar();
    aviso(S.som ? 'Sons ligados' : 'Sons desligados');
  }
  let musicaAntes = 'media';
  function alternarMusica() {
    if (S.musica === 'desligada') S.musica = musicaAntes || 'media';
    else { musicaAntes = S.musica; S.musica = 'desligada'; }
    Musica.nivel = S.musica;
    salvar();
    aviso(S.musica === 'desligada' ? 'Música de fundo desligada' : 'Música de fundo ligada');
    const b = $('#b-musica .ico');
    if (b) b.textContent = S.musica === 'desligada' ? '🔕' : '🎵';
  }

  /* ------------------------------------------------------------ cronômetro */

  const Crono = {
    total: 0, resta: 0, rodando: false, iv: null, aoAcabar: null, alvo: 0, ultimo: 0,
    caixa() { return document.getElementById('cronometro'); },
    montar(seg, opc) {
      opc = opc || {};
      this.parar();
      const box = this.caixa();
      if (!box) return;
      if (!seg || (S.tempo === 'sem' && !opc.forcar)) { this.total = 0; box.hidden = true; return; }
      const mult = (S.tempo === 'mais' && !opc.forcar) ? 1.5 : 1;
      this.total = Math.round(seg * mult);
      this.resta = this.total;
      this.aoAcabar = opc.aoAcabar || null;
      box.hidden = false;
      box.className = 'cronometro';
      box.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="cr-fundo" cx="50" cy="50" r="43"/>' +
        '<circle class="cr-arco" cx="50" cy="50" r="43" pathLength="100"/></svg><span class="cr-num"></span><span class="cr-play">▶</span>';
      box.onclick = () => this.alternar();
      this.desenhar();
      if (opc.auto) this.iniciar();
    },
    esconder() { this.parar(); this.total = 0; const b = this.caixa(); if (b) b.hidden = true; },
    iniciar() {
      if (this.rodando || !this.total || this.resta <= 0) return;
      this.rodando = true;
      this.alvo = Date.now() + this.resta * 1000;
      this.ultimo = Math.ceil(this.resta);
      this.iv = setInterval(() => this.passo(), 100);
      this.desenhar();
    },
    passo() {
      this.resta = Math.max(0, (this.alvo - Date.now()) / 1000);
      const s = Math.ceil(this.resta);
      if (s !== this.ultimo) {
        this.ultimo = s;
        if (s > 0 && s <= 5) Som.tiqueForte();
        else if (s > 0 && s <= 10) Som.tique();
      }
      if (this.resta <= 0) {
        this.pausar();
        const b = this.caixa();
        if (b) b.classList.add('esgotado');
        Som.tempo();
        if (this.aoAcabar) this.aoAcabar();
      }
      this.desenhar();
    },
    pausar() { clearInterval(this.iv); this.iv = null; this.rodando = false; this.desenhar(); },
    parar() { clearInterval(this.iv); this.iv = null; this.rodando = false; },
    alternar() {
      if (!this.total) return;
      if (this.resta <= 0) { this.reiniciar(); return; }
      if (this.rodando) this.pausar(); else this.iniciar();
    },
    reiniciar() {
      if (!this.total) return;
      this.parar();
      this.resta = this.total;
      const b = this.caixa();
      if (b) b.classList.remove('esgotado');
      this.iniciar();
    },
    desenhar() {
      const b = this.caixa();
      if (!b || !this.total) return;
      const arco = b.querySelector('.cr-arco');
      const num = b.querySelector('.cr-num');
      if (!arco || !num) return;
      const p = Math.max(0, this.resta / this.total) * 100;
      arco.setAttribute('stroke-dasharray', `${p.toFixed(2)} 100`);
      num.textContent = this.resta <= 0 ? 'Tempo!' : String(Math.ceil(this.resta));
      b.classList.toggle('rodando', this.rodando);
      b.classList.toggle('alerta', this.resta > 0 && this.resta <= 5);
      b.setAttribute('aria-label', `Cronômetro: ${Math.ceil(this.resta)} segundos`);
    }
  };

  /* ------------------------------------------------------------ placar e pontos */

  function tela(nome) {
    document.body.dataset.tela = nome;
    if (nome !== 'fim') pararHino();   /* saiu da tela do campeão: o hino some aos poucos */
    Musica.tela(nome);
  }

  function painelTime(i) {
    const t = S.times[i];
    return `<button class="time time-${i}" data-time="${i}" style="${estiloTime(i)}" title="Corrigir placar">
      <span class="time-emoji">${t.emoji}</span>
      <span class="time-nome">${esc(t.nome)}</span>
      <span class="time-pontos">${fmtInt(t.pontos)}</span>
      <span class="time-vez">É a vez!</span></button>`;
  }
  function renderPlacar(centro) {
    el.placar.classList.remove('placar-segredo');
    el.placar.innerHTML = painelTime(0) + `<div class="placar-centro">${centro || ''}</div>` + painelTime(1);
    $$('.time', el.placar).forEach(b => { b.onclick = abrirAjustePlacar; });
  }
  /* 2ª rodada da Aposta Final: o placar some até a revelação do campeão (sem spoiler) */
  const placarSecreto = () => el.placar.classList.contains('placar-segredo');
  function esconderPlacar() {
    el.placar.classList.add('placar-segredo');
    $$('.time', el.placar).forEach(b => { b.onclick = null; b.title = 'O placar volta na revelação do campeão'; });
    $$('.time-pontos', el.placar).forEach(p => { p.textContent = '???'; });
  }
  function destacarVez(i) {
    const emJogo = document.body.dataset.tela === 'pergunta';
    $$('.time', el.placar).forEach(b => {
      const k = +b.dataset.time;
      const nome = S.jogadores && S.jogadores[k];
      b.classList.toggle('vez', k === i);
      b.classList.toggle('com-jogador', emJogo && !!nome);
      const tag = b.querySelector('.time-vez');
      if (tag) tag.textContent = emJogo && nome ? (k === i ? `Vez de ${nome}!` : nome) : 'É a vez!';
    });
  }
  function atualizarPontosPlacar() {
    if (placarSecreto()) return;
    [0, 1].forEach(i => {
      const p = $(`.time-${i} .time-pontos`, el.placar);
      if (p) p.textContent = fmtInt(S.times[i].pontos);
    });
  }

  function darPontos(i, pts, motivo, origem) {
    if (!pts) return;
    const antes = S.times[i].pontos;
    S.times[i].pontos += pts;
    S.historico.push({ i, pts, motivo: motivo || '' });
    if (S.historico.length > 400) S.historico.shift();
    salvar();
    if (placarSecreto()) { Som.moeda(); return; }
    voarPontos(i, pts, origem, () => {
      const alvo = $(`.time-${i} .time-pontos`, el.placar);
      Efeitos.contar(alvo, antes, S.times[i].pontos, 700, fmtInt);
      const card = $(`.time-${i}`, el.placar);
      if (card) { card.classList.remove('pulo'); void card.offsetWidth; card.classList.add('pulo'); }
      Som.moeda();
    });
  }
  function voarPontos(i, pts, origem, fim) {
    const alvo = $(`.time-${i} .time-pontos`, el.placar);
    if (!alvo || Efeitos.reduzir) { if (fim) fim(); return; }
    const r0 = origem ? origem.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const v = document.createElement('div');
    v.className = 'voo' + (pts < 0 ? ' negativo' : '');
    v.textContent = (pts > 0 ? '+' : '') + fmtInt(pts);
    v.style.left = (r0.left + r0.width / 2) + 'px';
    v.style.top = (r0.top + r0.height / 2) + 'px';
    document.body.appendChild(v);
    setTimeout(() => {
      const a = $(`.time-${i} .time-pontos`, el.placar) || alvo;
      const r1 = a.getBoundingClientRect();
      v.style.left = (r1.left + r1.width / 2) + 'px';
      v.style.top = (r1.top + r1.height / 2) + 'px';
      v.style.fontSize = '2rem';
      v.style.opacity = '0';
    }, 450);
    setTimeout(() => { v.remove(); if (fim) fim(); }, 1350);
  }

  function abrirAjustePlacar() {
    const ajuste = i => `<div class="ajuste-time" style="${estiloTime(i)}">
        <div class="nome">${nomeTime(i)}</div>
        <div class="pts" id="aj${i}">${fmtInt(S.times[i].pontos)}</div>
        <div class="botoes">${[-50, -10, 10, 50].map(d => `<button class="btn claro" data-i="${i}" data-d="${d}">${d > 0 ? '+' : '−'}${Math.abs(d)}</button>`).join('')}</div>
      </div>`;
    abrirModal(`<div class="cartao modal" role="dialog" aria-modal="true">
      <h2>Corrigir placar</h2>
      <div class="ajuste-placar">${ajuste(0)}${ajuste(1)}</div>
      <div class="modal-acoes">
        <button class="btn sutil" id="m-desfazer">↶ Desfazer a última pontuação</button>
        <button class="btn primario" id="m-ok">Pronto</button>
      </div></div>`);
    const atualizar = () => {
      [0, 1].forEach(i => { $('#aj' + i).textContent = fmtInt(S.times[i].pontos); });
      $('#m-desfazer').disabled = !S.historico.length;
      atualizarPontosPlacar();
      salvar();
    };
    $$('.ajuste-time .btn', el.sobre).forEach(b => {
      b.onclick = () => {
        const i = +b.dataset.i, d = +b.dataset.d;
        S.times[i].pontos += d;
        S.historico.push({ i, pts: d, motivo: 'ajuste' });
        Som.clique();
        atualizar();
      };
    });
    $('#m-desfazer').onclick = () => {
      const h = S.historico.pop();
      if (!h) return;
      S.times[h.i].pontos -= h.pts;
      aviso(`Desfeito: ${h.pts > 0 ? '+' : ''}${h.pts} de ${S.times[h.i].nome}`);
      atualizar();
    };
    $('#m-ok').onclick = fecharModal;
    teclasModal.Enter = fecharModal;
    atualizar();
  }

  /* ------------------------------------------------------------ fluxo de pergunta */

  let ctx = null;
  const RENDER = {};

  function limparCtx() {
    if (ctx && ctx.limpar) { try { ctx.limpar(); } catch (e) { /* ignora */ } }
    Efeitos.limpar();
  }

  function abrirModulo(id) {
    const m = MOD[id];
    const idx = proximaPergunta(id);
    if (idx === null || restantes(id) < 2) { aviso(`As perguntas de “${m.nome}” acabaram.`); return; }
    if (!timesCompletos()) {
      aviso('Antes de jogar, escreva os integrantes de cada time.', 3200);
      irConfig('painel');
      return;
    }
    sortearJogadores(m, () => abrirPergunta(id, idx));
  }

  /* ---------- roleta de nomes: quem joga a rodada */
  const rotNomes = [0, 0];
  function rodaNomesSVG(i, destaque) {
    const t = S.times[i];
    const c = CORES[t.cor] || CORES.carmesim;
    const n = t.membros.length, R = 500, seg = 360 / n;
    const pt = (ang, r) => {
      const a = (ang - 90) * Math.PI / 180;
      return [(Math.cos(a) * r).toFixed(1), (Math.sin(a) * r).toFixed(1)];
    };
    const fatias = t.membros.map((nome, k) => {
      const a0 = k * seg, a1 = (k + 1) * seg, meio = a0 + seg / 2;
      const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R);
      const jogou = destaque.includes(nome);
      const cor = jogou ? '#4a3f63' : (k % 2 ? c.escura : c.base);
      const d = n === 1 ? `M0 ${-R} A${R} ${R} 0 1 1 -0.1 ${-R} Z` : `M0 0 L${x0} ${y0} A${R} ${R} 0 ${seg > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
      const fs = Math.max(28, Math.min(92, 1800 / Math.max(n, 3), 640 / Math.max(nome.length, 4)));
      return `<path d="${d}" fill="${cor}" stroke="#1B0F36" stroke-width="5"/>
        <text transform="rotate(${(meio - 90).toFixed(2)})" x="${R * 0.9}" y="0" text-anchor="end" dominant-baseline="central"
          font-size="${fs.toFixed(0)}" font-weight="800" fill="${jogou ? 'rgba(255,246,227,.45)' : (c.texto === '#fff' ? '#fff' : '#2A1A3E')}"
          font-family="Baloo 2, Segoe UI, sans-serif">${esc(nome)}</text>`;
    }).join('');
    return `<svg viewBox="-530 -530 1060 1060" aria-hidden="true">
        <circle r="525" fill="#F4B731"/>
        <g id="rn${i}" style="transform:rotate(${rotNomes[i]}deg)">${fatias}</g>
        <circle r="105" fill="#1B0F36" stroke="#FFF6E3" stroke-width="12"/>
        <text y="6" text-anchor="middle" dominant-baseline="central" font-size="110">${t.emoji}</text>
      </svg>`;
  }
  function girarRoda(i, alvo, dur, fim) {
    const g = $('#rn' + i);
    const n = S.times[i].membros.length, seg = 360 / n;
    const c = (alvo + 0.5) * seg;
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const ini = rotNomes[i];
    const base = ((360 - c - ini) % 360 + 360) % 360;
    const fimRot = ini + 360 * 5 + base + jitter;
    const t0 = performance.now();
    let ultimo = Math.floor(ini / seg);
    let acabou = false;
    function terminar() {
      if (acabou) return;
      acabou = true;
      if (g) g.style.transform = `rotate(${fimRot}deg)`;
      rotNomes[i] = fimRot % 360;
      fim();
    }
    function quadro(agora) {
      if (acabou) return;
      const p = Math.min(1, (agora - t0) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      const ang = ini + (fimRot - ini) * e;
      if (g) g.style.transform = `rotate(${ang}deg)`;
      const sAt = Math.floor(ang / seg);
      if (sAt !== ultimo) { ultimo = sAt; if (i === 0 || n < 3) Som.giro(); }
      if (p < 1) { requestAnimationFrame(quadro); return; }
      terminar();
    }
    requestAnimationFrame(quadro);
    /* Garantia: se o navegador pausar a animação, o sorteio termina mesmo assim. */
    setTimeout(terminar, dur + 400);
  }

  function sortearJogadores(mod, depois) {
    const anteriores = (S.jogadores || [null, null]).slice();
    let escolhidos = [null, null];
    let girando = false, pronto = false;

    function desenhar(destaques) {
      abrirModal(`<div class="sorteio">
        <h2 class="sorteio-titulo">Quem joga esta rodada?</h2>
        <p class="sorteio-sub">${mod.icone} ${mod.nome}</p>
        <div class="sorteio-rodas">${[0, 1].map(i => {
          const t = S.times[i];
          const livres = t.membros.filter(n => !destaques[i].includes(n)).length;
          return `<div class="sorteio-time" style="${estiloTime(i)}">
            <div class="sorteio-cab">${nomeTime(i)}<span class="sorteio-papel">${i === S.vez ? 'joga primeiro' : 'joga em seguida'}</span></div>
            <div class="roda-caixa roda-nomes"><div class="ponteiro"></div>${rodaNomesSVG(i, destaques[i])}</div>
            <div class="sorteio-nome" id="sn${i}">?</div>
            <div class="sorteio-falta">${livres} de ${t.membros.length} ainda ${livres === 1 ? 'não jogou' : 'não jogaram'} nesta volta</div>
          </div>`;
        }).join('')}</div>
        <div class="modal-acoes sorteio-acoes">
          <button class="btn" id="s-cancelar">Cancelar</button>
          <button class="btn azul" id="s-de-novo" disabled>${ICO_SORTEAR} Sortear de novo</button>
          <button class="btn primario grande" id="s-comecar" disabled>▶ Começar a rodada</button>
        </div></div>`);
      $('#s-cancelar').onclick = cancelar;
      $('#s-de-novo').onclick = deNovo;
      $('#s-comecar').onclick = comecar;
      teclasModal.Enter = () => { if (pronto) comecar(); };
      teclasModal.n = () => { if (pronto) deNovo(); };
    }

    function girar(evitar) {
      girando = true; pronto = false;
      /* quem já jogou nesta volta fica apagado na roda */
      escolhidos = [0, 1].map(i => sortearMembro(i, evitar && evitar[i]));
      const destaques = [0, 1].map(i => S.times[i].jogaram.filter(n => n !== escolhidos[i]));
      desenhar(destaques);
      /* trava DEPOIS de desenhar (abrir a janela destrava): clique fora não fecha a roleta girando */
      travaModal = true;
      /* se a janela fechar sem "Começar a rodada", ninguém perde a vez */
      aoFecharModal = desfazer;
      let faltam = 2;
      const dur = Efeitos.reduzir ? 300 : 3600;
      [0, 1].forEach(i => {
        const alvo = S.times[i].membros.indexOf(escolhidos[i]);
        girarRoda(i, alvo, dur + i * 700, () => {
          const e = $('#sn' + i);
          if (e) { e.textContent = escolhidos[i]; e.classList.add('revelado'); }
          Som.revelar();
          if (--faltam === 0) {
            girando = false; pronto = true; travaModal = false;
            S.jogadores = escolhidos.slice();
            salvar();
            $('#s-comecar').disabled = false;
            $('#s-de-novo').disabled = false;
            Efeitos.confete({ y: 0.55, qtd: 80 });
          }
        });
      });
    }
    function deNovo() {
      if (girando) return;
      const antes = escolhidos.slice();
      [0, 1].forEach(i => desfazerSorteio(i, antes[i]));
      aoFecharModal = null;
      girar(antes);
    }
    function desfazer() {
      [0, 1].forEach(i => { if (escolhidos[i]) desfazerSorteio(i, escolhidos[i]); });
      escolhidos = [null, null];
      S.jogadores = anteriores;
      salvar();
    }
    function cancelar() {
      if (girando) return;
      fecharModal();   /* o aoFecharModal desfaz o sorteio */
    }
    function comecar() {
      if (!pronto) return;
      aoFecharModal = null;
      fecharModal();
      depois();
    }
    girar(null);
  }

  /* info: { time: quem joga esta pergunta, primeiro: quem começou a rodada, etapa: 0 ou 1 } */
  function abrirPergunta(id, idx, info) {
    info = info || { time: S.vez, primeiro: S.vez, etapa: 0 };
    limparCtx();
    Crono.parar();
    fecharModal();
    const mod = MOD[id];
    const q = mod.perguntas[idx];
    marcarUsada(id, idx);
    ctx = { mod, q, idx, time: info.time, timeInicial: info.primeiro, etapa: info.etapa, roubo: false, valor: mod.pontos, concluida: false, limpar: null };
    teclasLocais = {};
    tela('pergunta');
    renderPlacar(`<div class="centro-pergunta">
        <div class="chip-mod ${classeCor(mod)}">${mod.icone} ${mod.nome} <small class="etapa">${info.etapa + 1}ª de 2</small></div>
        <div class="vale" id="vale"></div>
        <button class="cronometro" id="cronometro" hidden aria-label="Cronômetro"></button>
      </div>`);
    destacarVez(ctx.time);
    el.palco.innerHTML = '<section class="cartao cartao-pergunta"><div class="cp-corpo"></div></section>';
    RENDER[mod.tipo]($('.cp-corpo', el.palco));
  }

  function setValor(v, html) {
    if (!ctx) return;
    ctx.valor = v;
    const e = $('#vale');
    if (e) e.innerHTML = html || `Vale <b>${fmtInt(v)}</b> pontos`;
  }

  function pular() {
    const id = ctx.mod.id;
    const info = { time: ctx.time, primeiro: ctx.timeInicial, etapa: ctx.etapa };
    limparCtx();
    ctx = null;
    const idx = proximaPergunta(id);
    if (idx === null) { aviso('Não há mais perguntas neste jogo.'); irPainel(); return; }
    abrirPergunta(id, idx, info);
  }

  function bandejaJulgar(opc) {
    opc = opc || {};
    const v = ctx.valor;
    bandeja([
      { txt: `${opc.certo || 'Acertou'} +${v}`, ico: '✓', cls: 'ok', tecla: 'a', fn: () => concluir(v) },
      opc.meio ? { txt: `${opc.meioTxt || 'Meio certo'} +${metade(v)}`, ico: '½', cls: 'meio', tecla: 'm', fn: () => concluir(metade(v)) } : null,
      { txt: 'Errou', ico: '✗', cls: 'erro', tecla: 'e', fn: () => concluir(0) }
    ]);
  }

  function concluir(pts, opc) {
    opc = opc || {};
    if (!ctx || ctx.concluida) return;
    ctx.concluida = true;
    Crono.pausar();
    teclasLocais = {};
    const t = S.times[ctx.time];
    let cls = 'ok';
    let principal = opc.selo || (pts > 0 ? `+${fmtInt(pts)}` : 'Errou!');
    let sub = pts > 0 ? `+${fmtInt(pts)} para ${quemJoga(ctx.time)}` : (opc.seloSub || 'Ninguém pontuou');
    if (pts <= 0) { cls = 'erro'; principal = opc.seloErro || opc.selo || 'Errou!'; }
    else if (pts < ctx.valor) cls = 'meio';

    const selo = document.createElement('div');
    selo.className = 'selo ' + cls;
    selo.innerHTML = `${principal}<small>${sub}</small>`;
    el.palco.appendChild(selo);
    setTimeout(() => selo.classList.add('canto'), 1500);

    if (pts > 0) {
      darPontos(ctx.time, pts, ctx.mod.nome, selo);
      if (pts >= ctx.valor) { Som.acerto(); Efeitos.confete({ y: 0.45 }); }
      else Som.meio();
    } else if (!opc.silencio) {
      Som.erro();
    }
    if (ctx.etapa === 0) {
      const outro = 1 - ctx.time;
      bandeja([
        { txt: `Agora é a vez de ${quemJogaCurto(outro)}`, ico: '▶', cls: 'primario', tecla: 'Enter', fn: segundaJogada }
      ]);
    } else {
      bandeja([
        { txt: 'Próxima rodada', ico: '▶', cls: 'primario', tecla: 'Enter', fn: proximoTurno }
      ]);
    }
  }

  /* Depois da primeira equipe, a outra joga uma pergunta do mesmo jogo. */
  function segundaJogada() {
    const id = ctx.mod.id;
    const info = { time: 1 - ctx.time, primeiro: ctx.timeInicial, etapa: 1 };
    const idx = proximaPergunta(id);
    if (idx === null) { aviso('As perguntas deste jogo acabaram.'); proximoTurno(); return; }
    abrirPergunta(id, idx, info);
  }

  function proximoTurno() {
    S.vez = 1 - (ctx ? ctx.timeInicial : S.vez);
    salvar();
    irPainel();
  }

  function explica(ref, texto, antes) {
    return `<div class="explica revelar-entra">${antes || ''}${ref ? `<span class="chip chip-ref">${ref}</span>` : ''}${texto ? `<p>${texto}</p>` : ''}</div>`;
  }

  function proximidade(g, real, tol) {
    if (!(g > 0)) return { fator: 0, rotulo: 'Sem palpite' };
    if (Math.abs(g - real) / real < 0.005) return { fator: 1, rotulo: 'Exato!', exato: true };
    const r = Math.max(g / real, real / g);
    const f = tol === 'larga' ? [1.25, 1.6, 2.5, 5] : [1.1, 1.25, 1.5, 2];
    if (r <= f[0]) return { fator: 1, rotulo: 'Na mosca!' };
    if (r <= f[1]) return { fator: 0.75, rotulo: 'Quase lá!' };
    if (r <= f[2]) return { fator: 0.5, rotulo: 'Esquentou' };
    if (r <= f[3]) return { fator: 0.25, rotulo: 'Morno' };
    return { fator: 0, rotulo: 'Frio…' };
  }

  /* ============================================================ JOGOS */

  /* ---------- Do Tamanho Certo / Quanto Vale Hoje? / Bíblia em Números */
  RENDER.estimativa = function (corpo) {
    if (ctx.mod.visual === 'tamanho') { tamanhoCerto(corpo); return; }
    const { mod, q } = ctx;
    const dinheiro = mod.visual === 'dinheiro';
    const un = dinheiro ? 'R$' : (q.unidade || '');
    const real = dinheiro ? q.denarios * diaria() : q.resposta;
    const t = S.times[ctx.time];
    const dica = q.dica || mod.dica;
    const dicaInput = dinheiro ? 'Pode digitar “30 mil”, “2,5 milhões”…' : '';
    setValor(mod.pontos, `Até <b>${mod.pontos}</b> pontos`);

    corpo.innerHTML = `
      <div class="est">
        <div class="est-objeto"><span class="emoji-grande">${q.emoji}</span></div>
        <div class="est-texto">
          <h2 class="titulo-q">${q.titulo}</h2>
          <p class="pergunta">${q.pergunta}</p>
          ${q.ref ? `<p class="referencia"><span class="ref-emoji">${q.ref.emoji}</span><span>Para comparar: <b>${q.ref.nome}</b> ≈ ${fmtValor(q.ref.valor, un)}</span></p>` : ''}
          ${dica ? `<p class="dica">💡 ${dica}</p>` : ''}
          ${dinheiro ? reguaPrecos() : `<label class="palpite">
            <span class="palpite-campo"><input id="palpite" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="?">${un ? `<span class="un">${nomeUnidade(un, 2)}</span>` : ''}</span>
            <span class="palpite-leitura" id="leitura">${dicaInput}</span>
          </label>`}
        </div>
      </div>`;

    const inp = $('#palpite', corpo);
    const leit = $('#leitura', corpo);
    let revelado = false;
    /* Quanto Vale Hoje?: a régua de preços (o campo de digitar fica junto, para valor exato) */
    const regua = dinheiro ? ligarRegua(corpo, () => revelado) : null;
    if (!dinheiro) {
      inp.addEventListener('input', () => {
        const v = lerNumero(inp.value);
        leit.textContent = inp.value.trim() ? (isFinite(v) ? '= ' + fmtValorCompleto(v, un) : 'Não entendi esse número') : dicaInput;
      });
      setTimeout(() => inp.focus(), 60);
    }
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); revelar(); } });

    bandeja([{ txt: 'Revelar', ico: '👀', cls: 'primario', tecla: 'r', fn: revelar }, '|', bPular()]);
    Crono.montar(mod.tempo, { auto: true });

    function revelar() {
      if (revelado || !ctx || ctx.concluida) return;
      revelado = true;
      Crono.pausar();
      inp.disabled = true;
      const g = regua ? regua.valor() : lerNumero(inp.value);
      bandeja([]);
      Som.suspense(1.2);
      setTimeout(() => mostrar(g), Efeitos.reduzir ? 150 : 1250);
    }

    function mostrar(g) {
      if (!ctx || ctx.q !== q) return;
      const temPalpite = isFinite(g) && g > 0;
      const prox = proximidade(g, real, mod.tolerancia);
      const pts = Math.round(mod.pontos * prox.fator);

      let contas = '';
      if (dinheiro) {
        contas = `<div class="conta">${q.conta}</div>
          <div class="conta">${fmtDenarios(q.denarios)} × ${fmtBRL(diaria())} por dia = ${fmtBRL(real)}</div>
          <div class="conta conta-base">1 dia de trabalho = salário mínimo (${fmtBRL(S.salario)}) ÷ 30</div>`;
      } else if (q.conta) {
        contas = `<div class="conta">${q.conta}</div>`;
      }
      const comp = q.ref ? `<div class="comparacao">${q.ref.emoji} ≈ ${fmtNum(real / q.ref.valor, 1)}× ${q.ref.nome.toLowerCase()}</div>` : '';

      corpo.innerHTML = `
        <div class="est-rev revelar-entra">
          <div class="grafico-caixa">
            <div class="grafico" id="grafico"></div>
            <div class="grafico-legenda" id="legenda"></div>
          </div>
          <div class="rev-info">
            <h2 class="titulo-q">${q.emoji} ${q.titulo}</h2>
            <div class="rev-valor" id="rev-valor">…</div>
            ${contas}${comp}
            ${explica(q.versiculo, q.curiosidade)}
          </div>
        </div>`;

      const cols = [];
      if (q.ref) cols.push({ cls: 'c-ref', v: q.ref.valor, emoji: q.ref.emoji, nome: q.ref.nome });
      if (temPalpite) cols.push({ cls: 'c-palpite', v: g, emoji: t.emoji, nome: 'Palpite' });
      cols.push({ cls: 'c-real', v: real, emoji: q.emoji, nome: 'Resposta' });
      montarGrafico($('#grafico', corpo), $('#legenda', corpo), cols, un, t);

      Efeitos.contar($('#rev-valor', corpo), real / 20, real, 1200, v => fmtValor(v, un));
      Som.revelar();
      if (prox.exato) setTimeout(() => Efeitos.chuva(120), 400);
      concluir(pts, { selo: prox.rotulo, seloErro: prox.rotulo, seloSub: temPalpite ? 'Ninguém pontuou' : 'Sem palpite' });
    }
  };

  /* ---------- Quanto Vale Hoje?: régua de preços em escala de "zeros" (cada trecho é ×10) */
  const REGUA = { min: -1, max: 10 };   /* de R$ 0,10 a R$ 10 bilhões (log10) */
  const rotuloMarco = e => ['R$ 0,10', 'R$ 1', 'R$ 10', 'R$ 100', 'R$ 1 mil', 'R$ 10 mil', 'R$ 100 mil', 'R$ 1 mi', 'R$ 10 mi', 'R$ 100 mi', 'R$ 1 bi', 'R$ 10 bi'][e + 1];
  /* dois algarismos significativos: R$ 2.300, R$ 45 mil, R$ 1,2 milhão */
  function arredondarPreco(v) {
    if (!(v > 0)) return 0;
    const e = Math.floor(Math.log10(v)), f = Math.pow(10, e - 1);
    return Math.round(v / f) * f;
  }
  function reguaPrecos() {
    const pct = x => ((x - REGUA.min) / (REGUA.max - REGUA.min) * 100).toFixed(2);
    return `<div class="cb">
        <div class="cb-cab"><b class="cb-valor" id="cbv"></b></div>
        <div class="cb-regua" id="cbr">
          <div class="cb-trilho"></div><div class="cb-cheio" id="cbc"></div>
          ${Array.from({ length: REGUA.max - REGUA.min + 1 }, (_, k) => REGUA.min + k).map(e => `<div class="cb-marco${e % 2 ? ' menor' : ''}${e % 4 ? ' meio' : ''}" style="left:${pct(e)}%"><span class="cb-tique"></span>${e % 2 ? '' : `<span class="cb-preco">${rotuloMarco(e)}</span>`}</div>`).join('')}
          <div class="cb-pino" id="cbp"></div>
        </div>
        <div class="cb-baixo">
          <button type="button" class="btn erro gts-mm" id="cbm" aria-label="Diminuir">−</button>
          <button type="button" class="btn ok gts-mm" id="cbmais" aria-label="Aumentar">+</button>
          <span class="cb-dica so-mouse">Arraste o marcador, use −/+, as setas ← → ou a rodinha do mouse.</span>
          <span class="cb-dica so-toque">Arraste o marcador ou toque em −/+.</span>
          <label class="cb-digitar">ou digite: <span class="un">R$</span><input id="palpite" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="30 mil"></label>
        </div>
      </div>`;
  }
  function ligarRegua(corpo, travada) {
    const r = $('#cbr', corpo), pino = $('#cbp', corpo), cheio = $('#cbc', corpo), balao = $('#cbv', corpo), inp = $('#palpite', corpo);
    let x = 3;                 /* começa em R$ 1 mil */
    let digitado = null;       /* valor exato digitado (vale mais que a régua) */
    const valor = () => digitado || arredondarPreco(Math.pow(10, x));
    function desenhar(som) {
      const p = (x - REGUA.min) / (REGUA.max - REGUA.min);
      pino.style.left = cheio.style.width = (p * 100) + '%';
      balao.textContent = fmtValor(valor(), 'R$');
      if (som) Som.tamanho(p);
    }
    function ir(nx, som) {
      if (travada()) return;
      nx = Math.max(REGUA.min, Math.min(REGUA.max, nx));
      if (Math.abs(nx - x) < 1e-6) return;
      x = nx;
      digitado = null;
      if (document.activeElement !== inp) inp.value = '';
      desenhar(som !== false);
    }
    const doPonteiro = e => { const b = r.getBoundingClientRect(); ir(REGUA.min + (e.clientX - b.left) / b.width * (REGUA.max - REGUA.min)); };
    let arrastando = false;
    r.addEventListener('pointerdown', e => { if (travada()) return; arrastando = true; try { r.setPointerCapture(e.pointerId); } catch (er) { /* ponteiro sintético */ } doPonteiro(e); });
    r.addEventListener('pointermove', e => { if (arrastando) doPonteiro(e); });
    ['pointerup', 'pointercancel'].forEach(ev => r.addEventListener(ev, () => { arrastando = false; }));
    r.addEventListener('wheel', e => { e.preventDefault(); ir(x + (e.deltaY < 0 ? 0.05 : -0.05)); }, { passive: false });
    const repetir = (botao, d) => {
      let espera = null, iv = null;
      const parar = () => { clearTimeout(espera); clearInterval(iv); };
      botao.addEventListener('pointerdown', e => { e.preventDefault(); ir(x + d); espera = setTimeout(() => { iv = setInterval(() => ir(x + d), 60); }, 350); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => botao.addEventListener(ev, parar));
    };
    repetir($('#cbm', corpo), -0.05);
    repetir($('#cbmais', corpo), 0.05);
    const passo = (e, d) => { if (document.activeElement === inp) return; ir(x + d * (e && e.shiftKey ? 0.01 : 0.05)); };
    teclasLocais = { ArrowRight: e => passo(e, 1), ArrowUp: e => passo(e, 1), ArrowLeft: e => passo(e, -1), ArrowDown: e => passo(e, -1) };
    inp.addEventListener('input', () => {
      const v = lerNumero(inp.value);
      if (isFinite(v) && v > 0) {
        digitado = v;
        x = Math.max(REGUA.min, Math.min(REGUA.max, Math.log10(v)));
      } else digitado = null;
      desenhar(false);
    });
    desenhar(false);
    return { valor };
  }

  /* ---------- Do Tamanho Certo: o time estica ou encolhe a figura no palco */

  /* Desenha o emoji num canvas, recorta as bordas vazias e devolve a imagem
     com a proporção real, para a figura encostar no chão e no topo da medida. */
  const cacheSil = {};
  function figuraEmoji(emoji) {
    if (cacheSil[emoji]) return cacheSil[emoji];
    const desenho = window.ARTE && window.ARTE[emoji];
    if (desenho) return (cacheSil[emoji] = { url: desenho.url, ar: desenho.ar });
    const N = 300, L = Math.round(N * 1.6);
    const c = document.createElement('canvas');
    c.width = c.height = L;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.font = `${N}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(emoji, L / 2, L / 2);
    const d = x.getImageData(0, 0, L, L).data;
    let x0 = L, y0 = L, x1 = -1, y1 = -1;
    for (let y = 0; y < L; y++) {
      for (let i = 0; i < L; i++) {
        if (d[(y * L + i) * 4 + 3] > 24) {
          if (i < x0) x0 = i; if (i > x1) x1 = i;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0) { x0 = y0 = 0; x1 = y1 = L - 1; }
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const o = document.createElement('canvas');
    o.width = w; o.height = h;
    o.getContext('2d').drawImage(c, x0, y0, w, h, 0, 0, w, h);
    return (cacheSil[emoji] = { url: o.toDataURL(), ar: w / h });
  }
  function tetoBonito(v) {
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const f = v / p;
    return [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(k => k >= f - 1e-9) * p;
  }
  function passoBonito(v) {
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const f = v / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }

  function tamanhoCerto(corpo) {
    const { mod, q } = ctx;
    const t = S.times[ctx.time];
    const corT = (CORES[t.cor] || CORES.carmesim).base;
    const real = q.resposta, ref = q.ref.valor;
    const un = q.unidade || 'm';  /* metros, ou km na Nova Jerusalém */
    const largA = q.eixo === 'largura';
    const largR = (q.ref.eixo || q.eixo) === 'largura';
    const medida = q.medida || (largA ? 'Comprimento' : 'Altura');
    /* Limites do ajuste. A câmera acompanha a figura, então o palco não entrega a resposta. */
    const M = tetoBonito(Math.max(ref, real) * 3);
    const MIN = Math.min(ref, real) / 8;
    const fA = figuraEmoji(q.arte || q.emoji), fR = figuraEmoji(q.ref.arte || q.ref.emoji);
    let g = ref, ppu = 1, chao = 0, travado = false, revelado = false, congelado = false, vista = ref * 1.15;
    setValor(mod.pontos, `Até <b>${mod.pontos}</b> pontos`);
    corpo.classList.add('cp-gts');

    const fig = (id, f) => `<div class="gts-caixa" id="${id}">
        <div class="gts-sil" style="-webkit-mask-image:url(${f.url});mask-image:url(${f.url})"></div>
        <div class="gts-cor" style="background-image:url(${f.url})"></div>`;
    corpo.innerHTML = `
      <div class="gts" style="--ct:${corT}">
        <div class="gts-info">
          <div class="gts-card ref"><span class="gts-rot">Referência</span><b>${icone(q.ref.arte, q.ref.emoji)} ${q.ref.nome}</b><span>${q.ref.medida || (largR ? 'Comprimento' : 'Altura')}: ${fmtValor(ref, un)}</span></div>
          <div class="gts-card alvo"><span class="gts-rot">Ajuste o tamanho</span><b>${icone(q.arte, q.emoji)} ${q.titulo}</b><span>${q.pergunta}</span></div>
        </div>
        <div class="gts-palco" id="gp">
          <div class="gts-grade" id="gg"></div>
          <div class="gts-chao"></div>
          <div class="gts-fig ref">
            <div class="gts-tag"><b>${q.ref.nome}</b><span>${fmtValor(ref, un)}</span></div>
            ${fig('cr', fR)}<div class="gts-medida ${largR ? 'h' : 'v'}"></div></div>
          </div>
          <div class="gts-fig alvo">
            <div class="gts-tag"><b>${q.titulo}</b><span id="fa-v"></span></div>
            ${fig('ca', fA)}<button class="gts-alca" id="alca" aria-label="Arraste para mudar o tamanho">⤢</button></div>
          </div>
          <div class="gts-fantasma" id="gf" hidden><span>Palpite</span></div>
        </div>
        <div class="gts-baixo" id="gb">
          <button class="btn erro gts-mm" id="gmenos" aria-label="Diminuir">−</button>
          <button class="btn ok gts-mm" id="gmais" aria-label="Aumentar">+</button>
          <button class="btn azul gts-mm" id="gesq" aria-label="Mover para a esquerda">◀</button>
          <button class="btn azul gts-mm" id="gdir" aria-label="Mover para a direita">▶</button>
          <span class="gts-dica so-mouse">Tamanho: alça ⤢, botões −/+, rodinha do mouse ou setas ↑ ↓. Posição: arraste a figura ou use ◀ ▶ (setas ← →). Shift deixa o ajuste fino.</span>
          <span class="gts-dica so-toque">Tamanho: puxe a alça ⤢ ou toque em −/+. Posição: arraste a figura ou use ◀ ▶.</span>
        </div>
      </div>`;

    const gp = $('#gp', corpo), ca = $('#ca', corpo), cr = $('#cr', corpo);
    const faV = $('#fa-v', corpo), gg = $('#gg', corpo);

    function dim(v, f, larg) { return larg ? [v * ppu, v * ppu / f.ar] : [v * ppu * f.ar, v * ppu]; }
    function aplicar(el, v, f, larg) {
      const [w, h] = dim(v, f, larg);
      el.style.width = w + 'px';
      el.style.height = h + 'px';
    }
    /* A câmera enquadra a referência e o maior tamanho em cena, com folga. */
    function layout() {
      const H = gp.clientHeight, W = gp.clientWidth;
      if (!H || !W) return;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      chao = Math.max(22, Math.round(H * 0.08));
      if (!congelado) {
        const alto = H - chao - rem * 4.6;
        const largo = W * 0.4;
        /* Só afasta quando a figura sai do quadro e só aproxima quando
           ela fica bem menor, para a cena não ficar mexendo à toa. */
        const precisa = Math.max(ref, revelado ? Math.max(real, g) : g);
        if (precisa > vista) vista = precisa * 1.15;
        else if (precisa < vista * 0.45) vista = Math.max(precisa * 1.3, ref * 1.1);
        const vA = vista * 1.1, vR = ref * 1.1;
        const uA = largA ? [vA, vA / fA.ar] : [vA * fA.ar, vA];
        const uR = largR ? [vR, vR / fR.ar] : [vR * fR.ar, vR];
        ppu = Math.min(alto / uA[1], largo / uA[0], alto / uR[1], largo / uR[0]);
      }
      gp.style.setProperty('--chao', chao + 'px');
      const passo = passoBonito((H - chao) / ppu / 5);
      let linhas = '';
      for (let v = passo; v * ppu < H - chao - rem; v += passo) {
        linhas += `<div class="gl" style="bottom:${chao + v * ppu}px"><span>${fmtNum(v)} ${un}</span></div>`;
      }
      gg.innerHTML = linhas;
      aplicar(cr, ref, fR, largR);
      aplicar(ca, revelado ? real : g, fA, largA);
      aplicar($('#gf', corpo), g, fA, largA);
      posicionar();
    }

    /* Posição horizontal da figura do time (fração da largura do palco). */
    let pos = 0.7;
    const figA = corpo.querySelector('.gts-fig.alvo');
    const gfEl = $('#gf', corpo);
    function posicionar() {
      const W = gp.clientWidth;
      if (!W) return;
      const meia = Math.max(dim(revelado ? real : g, fA, largA)[0], dim(g, fA, largA)[0]) / 2;
      const margem = 12;
      const min = (meia + margem) / W, max = 1 - (meia + margem) / W;
      pos = min > max ? 0.5 : Math.max(min, Math.min(max, pos));
      figA.style.left = (pos * 100) + '%';
      gfEl.style.left = (pos * 100) + '%';
    }
    let comSom = false;   /* só depois de montar a tela (o primeiro mudar() é a posição inicial) */
    function mudar(v) {
      if (travado) return;
      const antes = g;
      g = Math.max(MIN, Math.min(M, v));
      faV.textContent = fmtValor(g, un);
      layout();
      if (comSom && g !== antes) Som.tamanho(Math.log(g / MIN) / Math.log(M / MIN));
    }

    /* arrastar: a figura anda para os lados; a alça ⤢ muda o tamanho */
    let arrastando = false, modo = 'tamanho', pega = 0;
    function moverPara(e) {
      const r = gp.getBoundingClientRect();
      if (modo === 'mover') {
        const antes = pos;
        pos = (e.clientX - r.left - pega) / r.width;
        posicionar();
        if (Math.abs(pos - antes) > 0.002) Som.mover(pos);
        return;
      }
      if (largA) {
        const rc = ca.getBoundingClientRect();
        const centro = rc.left + rc.width / 2;
        mudar(Math.abs(e.clientX - centro) * 2 / ppu);
      } else {
        mudar((r.bottom - chao - e.clientY) / ppu);
      }
    }
    const comecar = (e, m) => {
      if (travado) return;
      e.preventDefault();
      e.stopPropagation();
      modo = m;
      arrastando = true;
      congelado = true;
      const r = gp.getBoundingClientRect();
      pega = e.clientX - (r.left + pos * r.width);
      try { gp.setPointerCapture(e.pointerId); } catch (err) { /* ponteiro sintético */ }
      gp.classList.add('arrastando', m === 'mover' ? 'movendo' : 'redimensionando');
      moverPara(e);
    };
    ca.addEventListener('pointerdown', e => comecar(e, 'mover'));
    $('#alca', corpo).addEventListener('pointerdown', e => comecar(e, 'tamanho'));
    gp.addEventListener('pointermove', e => { if (arrastando) moverPara(e); });
    /* Ao soltar, a câmera reenquadra (afasta se a figura passou do topo). */
    const soltar = () => {
      if (!arrastando) return;
      arrastando = false;
      congelado = false;
      gp.classList.remove('arrastando', 'movendo', 'redimensionando');
      layout();
    };
    gp.addEventListener('pointerup', soltar);
    gp.addEventListener('pointercancel', soltar);
    gp.addEventListener('wheel', e => { e.preventDefault(); mudar(g * (e.deltaY < 0 ? 1.04 : 1 / 1.04)); }, { passive: false });

    /* botões −/+ (segurar repete) */
    function repetir(botao, acao) {
      let espera = null, iv = null;
      const parar = () => { clearTimeout(espera); clearInterval(iv); };
      botao.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (travado) return;
        acao();
        espera = setTimeout(() => { iv = setInterval(acao, 60); }, 350);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => botao.addEventListener(ev, parar));
    }
    const andar = d => { if (travado) return; pos += d; posicionar(); Som.mover(pos); };
    repetir($('#gmais', corpo), () => mudar(g * 1.05));
    repetir($('#gmenos', corpo), () => mudar(g / 1.05));
    repetir($('#gesq', corpo), () => andar(-0.012));
    repetir($('#gdir', corpo), () => andar(0.012));

    const passo = (e, sobe) => { const f = e && e.shiftKey ? 1.01 : 1.05; mudar(g * (sobe ? f : 1 / f)); };
    const lado = (e, d) => andar(d * (e && e.shiftKey ? 0.004 : 0.02));
    teclasLocais = {
      ArrowUp: e => passo(e, true), '+': e => passo(e, true), '=': e => passo(e, true),
      ArrowDown: e => passo(e, false), '-': e => passo(e, false),
      ArrowLeft: e => lado(e, -1), ArrowRight: e => lado(e, 1)
    };

    const obs = new ResizeObserver(() => layout());
    obs.observe(gp);
    ctx.limpar = () => obs.disconnect();
    layout();
    mudar(g);
    comSom = true;

    bandeja([{ txt: 'Confirmar tamanho', ico: '✔', cls: 'primario', tecla: 'Enter', fn: confirmar }, '|', bPular()]);
    Crono.montar(mod.tempo, { auto: true });

    function confirmar() {
      if (travado || !ctx || ctx.concluida) return;
      travado = true;
      teclasLocais = {};
      Crono.pausar();
      bandeja([]);
      corpo.querySelector('.gts').classList.add('travado');
      Som.suspense(1.2);
      setTimeout(mostrar, Efeitos.reduzir ? 150 : 1250);
    }

    function mostrar() {
      if (!ctx || ctx.q !== q) return;
      const prox = proximidade(g, real, mod.tolerancia);
      const pts = Math.round(mod.pontos * prox.fator);

      /* contorno tracejado no tamanho do palpite; a figura vai para o tamanho real */
      const gf = $('#gf', corpo);
      gf.querySelector('span').textContent = 'Palpite: ' + fmtValor(g, un);
      gf.hidden = false;
      revelado = true;
      const gts = corpo.querySelector('.gts');
      gts.classList.add('revelado');
      requestAnimationFrame(() => requestAnimationFrame(layout));
      Efeitos.contar(faV, g, real, 1200, v => fmtValor(v, un));
      Som.revelar();

      $('#gb', corpo).innerHTML = `<div class="gts-exp revelar-entra">
          <div class="gts-exp-num"><span>${medida}</span><b>${fmtValor(real, un)}</b></div>
          <div>
            <div class="conta">${q.conta}</div>
            <span class="comparacao">${icone(q.ref.arte, q.ref.emoji)} ≈ ${fmtNum(real / ref, 1)}× ${q.ref.nome.toLowerCase()}</span>
            <p><span class="chip chip-ref">${q.versiculo}</span> ${q.curiosidade}</p>
          </div>
        </div>`;
      if (prox.exato) setTimeout(() => Efeitos.chuva(120), 400);
      concluir(pts, { selo: prox.rotulo, seloErro: prox.rotulo });
    }
  }

  function montarGrafico(box, legenda, cols, un, time) {
    const vals = cols.map(c => c.v);
    const max = Math.max(...vals), min = Math.min(...vals);
    const log = max / min > 20;
    const corTime = (CORES[time.cor] || CORES.azul).base;
    box.innerHTML = cols.map(c => `
      <div class="coluna ${c.cls}" style="--cp:${corTime}">
        <div class="col-rot">${fmtValor(c.v, un)}</div>
        <div class="col-emoji">${c.emoji}</div>
        <div class="col-barra" style="--p:0"></div>
        <div class="col-nome">${esc(c.nome)}</div>
      </div>`).join('');
    legenda.textContent = log ? 'Escala comprimida para tudo caber na tela' : '';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$('.col-barra', box).forEach((b, i) => {
        const v = vals[i];
        let p;
        if (max === min) p = 1;
        else if (log) p = 0.12 + 0.88 * (Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min));
        else p = Math.max(0.04, v / max);
        b.style.setProperty('--p', p.toFixed(3));
      });
    }));
  }

  /* ---------- Mais ou Menos? */
  RENDER.maioumenor = function (corpo) {
    const { mod, q } = ctx;
    setValor(mod.pontos);
    const dinheiro = q.denarios != null;
    const vb = dinheiro ? q.denarios * diaria() : q.valor;
    const ub = dinheiro ? 'R$' : q.unidade;
    const vm = q.mod.valor;
    const certa = vb > vm ? 'mais' : 'menos';
    let escolhido = false;

    corpo.innerHTML = `
      <h2 class="mm-titulo">${q.pergunta}</h2>
      <div class="mm">
        <div class="mm-carta mm-bib">
          <span class="emoji-grande">${icone(q.arte, q.emoji, 'arte-grande')}</span>
          <p class="mm-texto">${q.bib}</p>
          <div class="mm-valor oculto" id="mm-valor">?</div>
        </div>
        <div class="mm-meio">
          <button class="escolha mm-btn mais" data-r="mais">⬆ ${q.rotulos[0]}</button>
          <button class="escolha mm-btn menos" data-r="menos">⬇ ${q.rotulos[1]}</button>
        </div>
        <div class="mm-carta mm-mod">
          <span class="emoji-grande">${icone(q.mod.arte, q.mod.emoji, 'arte-grande')}</span>
          <p class="mm-texto">${q.mod.texto}</p>
          <div class="mm-valor">${q.mod.mostra || fmtValor(vm, q.mod.unidade)}</div>
        </div>
      </div>
      <div class="mm-rodape" id="mm-rodape"></div>`;

    const btns = $$('.mm-btn', corpo);
    btns.forEach(b => { b.onclick = () => escolher(b.dataset.r); });
    teclasLocais = { '1': () => escolher('mais'), '2': () => escolher('menos'), ArrowUp: () => escolher('mais'), ArrowDown: () => escolher('menos') };
    bandeja([bPular()]);
    Crono.montar(mod.tempo, { auto: true });

    function escolher(r) {
      if (escolhido || ctx.concluida) return;
      escolhido = true;
      Crono.pausar();
      Som.clique();
      btns.forEach(b => {
        b.disabled = true;
        b.classList.add(b.dataset.r === r ? 'marcada' : 'apagada');
      });
      bandeja([]);
      Som.suspense(0.9);
      setTimeout(() => {
        if (!ctx || ctx.q !== q) return;
        const val = $('#mm-valor', corpo);
        val.classList.remove('oculto');
        const extra = dinheiro ? (q.mostraExtra || fmtDenarios(q.denarios)) : '';
        if (q.mostra) {
          val.innerHTML = q.mostra;
        } else {
          val.innerHTML = '<span id="mm-num"></span>' + (extra ? `<small>${extra}</small>` : '');
          Efeitos.contar($('#mm-num', corpo), vm, vb, 1000, v => fmtValor(v, ub));
        }
        const ok = r === certa;
        $('#mm-rodape', corpo).innerHTML = explica(q.versiculo, q.curiosidade);
        concluir(ok ? ctx.valor : 0, { selo: ok ? 'Acertou!' : 'Errou!' });
      }, Efeitos.reduzir ? 150 : 1000);
    }
  };

  /* ---------- Perfil Secreto */
  RENDER.pistas = function (corpo) {
    const { q } = ctx;
    const VAL = [100, 80, 60, 40, 20];
    let n = 0;
    let revelado = false;
    /* retrato que vai se montando: cada pista mostra mais uma camada do desenho */
    const retratoSvg = q.retrato && window.ARTE_RETRATOS ? window.ARTE_RETRATOS[q.retrato] : '';
    Crono.esconder();

    corpo.innerHTML = `
      <div class="perfil">
        <aside class="perfil-cartao">
          ${retratoSvg ? `<div class="retrato" id="pf-ret">${retratoSvg}</div>` : `<div class="avatar"><span><i>${q.avatar}</i></span></div>`}
          <div class="perfil-nome" id="pf-nome">? ? ?</div>
          <div class="perfil-usuario" id="pf-user">@perfil_secreto</div>
          <div class="perfil-contagem">Pista <b id="pf-n">0</b> de ${q.pistas.length}</div>
        </aside>
        <div class="feed" id="feed"></div>
      </div>`;
    const feed = $('#feed', corpo);
    function mostrarCamadas(ate, animar) {
      $$('#pf-ret .camada', corpo).forEach(g => {
        if (+g.dataset.n > ate || g.classList.contains('on')) return;
        g.classList.add('on');
        if (animar) g.classList.add('nova');
      });
    }

    function valorDe(k) { const v = VAL[Math.min(k, VAL.length) - 1]; return ctx.roubo ? metade(v) : v; }
    function proxima() {
      if (revelado || n >= q.pistas.length) return;
      n++;
      const post = document.createElement('article');
      post.className = 'post';
      post.innerHTML = `<span class="post-num">${n}</span><p>${q.pistas[n - 1]}</p>`;
      feed.appendChild(post);
      post.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      $('#pf-n', corpo).textContent = n;
      mostrarCamadas(n, n > 1);
      setValor(valorDe(n));
      if (n > 1) Som.passar();
      botoes();
    }
    function botoes() {
      if (revelado) return;
      setValor(valorDe(n));
      bandeja([
        n < q.pistas.length ? { txt: `Próxima pista (vale ${valorDe(n + 1)})`, ico: '➕', cls: 'azul', tecla: 'd', fn: proxima } : null,
        { txt: 'Revelar quem é', ico: '👀', cls: 'primario', tecla: 'r', fn: revelar },
        bPassar(botoes),
        '|', bPular()
      ]);
    }
    function revelar() {
      revelado = true;
      $('.perfil', corpo).classList.add('revelado');
      mostrarCamadas(5, true);
      $('#pf-nome', corpo).textContent = q.nome;
      $('#pf-user', corpo).textContent = q.usuario;
      const fim = document.createElement('div');
      fim.innerHTML = explica(q.versiculo, '');
      feed.appendChild(fim.firstElementChild);
      Som.revelar();
      bandejaJulgar({});
    }
    proxima();
  };

  /* ---------- Emojis da Bíblia */
  RENDER.emoji = function (corpo) {
    const { mod, q } = ctx;
    setValor(mod.pontos);
    let dicaUsada = false;
    let revelado = false;
    const grupos = q.emojis.split(' ').filter(Boolean);
    corpo.innerHTML = `
      <div class="emj">
        <span class="chip">${q.testamento}</span>
        <div class="emj-linha">${grupos.map((g, i) => `<span style="animation-delay:${(i * 0.12).toFixed(2)}s">${g}</span>`).join('')}</div>
        <p class="emj-pergunta" id="emj-p">Que história é essa?</p>
        <p class="emj-dica" id="emj-dica" hidden></p>
        <div id="emj-resp"></div>
      </div>`;

    function botoes() {
      if (revelado) return;
      bandeja([
        !dicaUsada ? { txt: `Dica (vale ${metade(ctx.valor)})`, ico: '💡', cls: 'azul', tecla: 'd', fn: dica } : null,
        { txt: 'Revelar', ico: '👀', cls: 'primario', tecla: 'r', fn: revelar },
        bPassar(botoes),
        '|', bPular()
      ]);
    }
    function dica() {
      dicaUsada = true;
      setValor(metade(ctx.valor));
      const d = $('#emj-dica', corpo);
      d.hidden = false;
      d.textContent = '💡 ' + q.dica;
      Som.passar();
      botoes();
    }
    function revelar() {
      revelado = true;
      Crono.pausar();
      $('#emj-p', corpo).hidden = true;
      $('#emj-resp', corpo).innerHTML = `<div class="revelar-entra"><div class="resposta-revelada">${q.resposta}</div>${explica(q.versiculo, '')}</div>`;
      Som.revelar();
      bandejaJulgar({ meio: true });
    }
    botoes();
    Crono.montar(mod.tempo, { auto: true });
  };

  /* ---------- Zoom Bíblico */
  RENDER.zoom = function (corpo) {
    const { mod, q } = ctx;
    const DUR = 26000, Z0 = 11, VMAX = mod.pontos, VMIN = 20;
    let t = 0, rodando = false, raf = null, ultimo = 0, fase = 'pronto';
    /* desenho próprio em SVG na página: continua nítido mesmo com o zoom de 11× */
    const desenhoZoom = q.arte && window.ARTE && window.ARTE[q.arte] ? window.ARTE[q.arte].svg : '';
    Crono.esconder();
    setValor(VMAX);

    corpo.innerHTML = `
      <div class="zoom">
        <div class="lente"><div class="lente-emoji${desenhoZoom ? ' lente-arte' : ''}" id="lz" style="transform-origin:${q.origem}">${desenhoZoom || q.emoji}</div></div>
        <div class="zoom-lado">
          <h3 id="zq">Que objeto é esse? E em qual história da Bíblia ele aparece?</h3>
          <div class="medidor">
            <div class="medidor-num" id="zm"></div>
            <div class="medidor-barra"><i id="zb"></i></div>
          </div>
          <div id="zr"></div>
        </div>
      </div>`;
    const lz = $('#lz', corpo), zm = $('#zm', corpo), zb = $('#zb', corpo);

    function aplicar() {
      lz.style.transform = `scale(${Math.pow(Z0, 1 - t).toFixed(4)})`;
      const v = Math.round((VMAX - (VMAX - VMIN) * t) / 5) * 5;
      const vv = ctx.roubo ? metade(v) : v;
      if (vv !== ctx.valor) setValor(vv);
      zm.innerHTML = `${vv} <small>pontos</small>`;
      zb.style.transform = `scaleX(${(1 - t * 0.8).toFixed(3)})`;
    }
    function loop(agora) {
      if (!rodando) return;
      t = Math.min(1, t + (agora - ultimo) / DUR);
      ultimo = agora;
      aplicar();
      if (t >= 1) { parar(); return; }
      raf = requestAnimationFrame(loop);
    }
    function comecar() {
      if (rodando) return;
      rodando = true;
      fase = 'rodando';
      ultimo = performance.now();
      raf = requestAnimationFrame(loop);
      botoes();
    }
    function parar() {
      rodando = false;
      cancelAnimationFrame(raf);
      if (fase !== 'revelado') { fase = 'parado'; botoes(); }
    }
    function revelar() {
      parar();
      fase = 'revelado';
      lz.style.transition = 'transform 0.9s cubic-bezier(.2,.9,.3,1)';
      lz.style.transform = 'scale(1)';
      $('#zq', corpo).textContent = 'Era isto:';
      $('#zr', corpo).innerHTML = `<div class="revelar-entra"><div class="resposta-revelada">${q.objeto}</div>
        <ul class="historias">${q.historias.map(h => `<li>${h}</li>`).join('')}</ul></div>`;
      Som.revelar();
      bandejaJulgar({ meio: true, certo: 'Objeto e história', meioTxt: 'Só um dos dois' });
    }
    function botoes() {
      if (fase === 'pronto') {
        bandeja([{ txt: 'Começar o zoom', ico: '▶', cls: 'primario', tecla: 'Enter', fn: comecar }, '|', bPular()]);
      } else if (fase === 'rodando') {
        bandeja([{ txt: 'Parar! Vão responder', ico: '✋', cls: 'primario', tecla: 'Enter', fn: parar }, { txt: 'Revelar', ico: '👀', tecla: 'r', fn: revelar }]);
      } else if (fase === 'parado') {
        bandeja([
          { txt: 'Revelar', ico: '👀', cls: 'primario', tecla: 'r', fn: revelar },
          t < 1 ? { txt: 'Continuar o zoom', ico: '▶', cls: 'azul', tecla: 'Enter', fn: comecar } : null,
          bPassar(() => { aplicar(); botoes(); }),
          '|', bPular()
        ]);
      }
    }
    teclasLocais = { ' ': () => { if (fase === 'rodando') parar(); else if (fase !== 'revelado' && t < 1) comecar(); } };
    ctx.limpar = () => { rodando = false; cancelAnimationFrame(raf); };
    aplicar();
    botoes();
  };

  /* ---------- Tá na Bíblia? e Aconteceu ou Não? (duas opções) */
  RENDER.verdadeiro = function (corpo) {
    const { mod, q } = ctx;
    const R = mod.rotulos || { sim: '📖 Tá na Bíblia', nao: '🙅 Não tá', certo: 'Está na Bíblia!', errado: 'Não está na Bíblia.' };
    setValor(mod.pontos);
    let escolhido = false;
    corpo.innerHTML = `
      <div class="vf">
        <p class="vf-frase${mod.fato ? ' fato' : ''}">${mod.fato ? '<span class="vf-tag">Aconteceu ou não?</span>' : ''}${q.frase}</p>
        <div class="vf-botoes">
          <button class="escolha vf-btn sim" data-r="1"><span class="letra">1</span>${R.sim}</button>
          <button class="escolha vf-btn nao" data-r="0"><span class="letra">2</span>${R.nao}</button>
        </div>
        <div id="vf-exp"></div>
      </div>`;
    const btns = $$('.vf-btn', corpo);
    btns.forEach(b => { b.onclick = () => escolher(b.dataset.r === '1'); });
    /* só 1 e 2: o N fica livre para ligar e desligar a música */
    teclasLocais = { '1': () => escolher(true), '2': () => escolher(false) };
    bandeja([bPular()]);
    Crono.montar(mod.tempo, { auto: true });

    function escolher(r) {
      if (escolhido || ctx.concluida) return;
      escolhido = true;
      Crono.pausar();
      btns.forEach(b => {
        b.disabled = true;
        b.classList.add((b.dataset.r === '1') === r ? 'marcada' : 'apagada');
      });
      bandeja([]);
      Som.suspense(0.8);
      setTimeout(() => {
        if (!ctx || ctx.q !== q) return;
        const ok = r === q.resposta;
        const tag = $('.vf-tag', corpo);
        if (tag) {
          tag.textContent = q.resposta ? '✅ ' + R.certo : '❌ ' + R.errado;
          tag.classList.add(q.resposta ? 'sim' : 'nao');
          $('.vf-frase', corpo).classList.add(q.resposta ? 'sim' : 'nao');
        }
        $('#vf-exp', corpo).innerHTML = explica(q.versiculo, `<b>${q.resposta ? R.certo : R.errado}</b> ${q.explicacao}`);
        concluir(ok ? ctx.valor : 0, { selo: ok ? 'Acertou!' : 'Errou!' });
      }, Efeitos.reduzir ? 150 : 900);
    }
  };

  /* ---------- opções (Quem Disse? e O Intruso) */
  function escolhaGenerica(cfg) {
    const box = cfg.box;
    let sel = null;
    let travado = false;
    const erradas = new Set();
    box.innerHTML = cfg.opcoes.map((o, i) => `<button class="opcao" data-i="${i}"><span class="letra">${i + 1}</span><span>${o.html}</span></button>`).join('');
    const btns = $$('.opcao', box);
    btns.forEach(b => { b.onclick = () => selecionar(+b.dataset.i); });
    teclasLocais = {};
    cfg.opcoes.forEach((_, i) => { teclasLocais[String(i + 1)] = () => selecionar(i); });

    function selecionar(i) {
      if (travado || erradas.has(i) || ctx.concluida) return;
      sel = i;
      btns.forEach((b, j) => b.classList.toggle('sel', j === i));
      Som.clique();
      botoes();
    }
    function botoes() {
      bandeja([
        { txt: 'Confirmar resposta', ico: '✔', cls: 'primario', tecla: 'Enter', fn: confirmarResp, desativado: sel === null },
        '|', bPular()
      ]);
    }
    function confirmarResp() {
      if (sel === null || travado) return;
      travado = true;
      Crono.pausar();
      bandeja([]);
      const escolhida = sel;
      const ok = cfg.opcoes[escolhida].certa;
      Som.suspense(0.7);
      setTimeout(() => {
        if (!ctx || ctx.concluida) return;
        const b = btns[escolhida];
        b.classList.remove('sel');
        if (ok) {
          b.classList.add('certo');
          btns.forEach((x, j) => { if (j !== escolhida) x.classList.add('apagada'); x.disabled = true; });
          cfg.aoRevelar();
          concluir(ctx.valor, { selo: 'Acertou!' });
        } else {
          b.classList.add('errado');
          b.disabled = true;
          erradas.add(escolhida);
          sel = null;
          revelarErro(false);
        }
      }, Efeitos.reduzir ? 150 : 800);
    }
    function revelarErro(silencio) {
      btns.forEach((x, j) => {
        x.disabled = true;
        x.classList.remove('sel');
        if (cfg.opcoes[j].certa) x.classList.add('certo');
        else if (!erradas.has(j)) x.classList.add('apagada');
      });
      cfg.aoRevelar();
      concluir(0, { selo: 'Errou!', silencio });
    }
    botoes();
  }

  RENDER.escolha = function (corpo) {
    const { mod, q } = ctx;
    setValor(mod.pontos);
    const ops = embaralhar(q.opcoes.map((o, i) => ({ html: esc(o), certa: i === 0 })));
    corpo.innerHTML = `
      <div class="qd">
        <div class="balao">“${q.frase}”</div>
        <div class="opcoes" id="ops"></div>
        <div id="qd-exp"></div>
      </div>`;
    escolhaGenerica({
      box: $('#ops', corpo), opcoes: ops,
      aoRevelar: () => { $('#qd-exp', corpo).innerHTML = explica(q.versiculo, q.contexto); }
    });
    Crono.montar(mod.tempo, { auto: true });
  };

  RENDER.intruso = function (corpo) {
    const { mod, q } = ctx;
    setValor(mod.pontos);
    const ops = embaralhar(q.itens.map((o, i) => ({ html: esc(o), certa: i === 3 })));
    corpo.innerHTML = `
      <div class="intr">
        <h2 class="intr-titulo">Qual destes não combina com os outros?</h2>
        <div class="opcoes" id="ops"></div>
        <div id="in-exp"></div>
      </div>`;
    escolhaGenerica({
      box: $('#ops', corpo), opcoes: ops,
      aoRevelar: () => {
        $('#in-exp', corpo).innerHTML = explica('', `<b>O grupo:</b> ${q.grupo}. ${q.explicacao}`);
      }
    });
    Crono.montar(mod.tempo, { auto: true });
  };

  /* ---------- Linha do Tempo */
  RENDER.ordem = function (corpo) {
    const { mod, q } = ctx;
    const porItem = mod.pontos / q.eventos.length;
    setValor(mod.pontos, `<b>${porItem}</b> pontos por posição certa`);
    const evs = q.eventos.map((e, i) => Object.assign({ i }, e));
    let monte = embaralhar(evs);
    if (monte.every((e, k) => e.i === k)) monte = monte.slice().reverse();
    const slots = evs.map(() => null);
    let travado = false;

    corpo.innerHTML = `
      <div class="ord">
        <h2 class="ord-titulo">Coloquem em ordem: <span>${q.titulo}</span></h2>
        <div class="trilho" id="trilho">${slots.map((_, k) => `<div class="slot" data-n="${k + 1}º"></div>`).join('')}</div>
        <div class="monte" id="monte"></div>
        <div id="ord-exp"></div>
      </div>`;

    function carta(e) {
      return `<button class="ord-carta" data-i="${e.i}"><span class="e">${e.emoji}</span>${e.texto}</button>`;
    }
    function desenhar() {
      $$('.slot', corpo).forEach((s, k) => { s.innerHTML = slots[k] ? carta(slots[k]) : ''; });
      const resto = monte.filter(e => !slots.includes(e));
      $('#monte', corpo).innerHTML = resto.length ? resto.map(carta).join('') : '<div class="monte-vazio">Tudo no lugar? Então confiram!</div>';
      $$('.slot .ord-carta', corpo).forEach(b => {
        b.onclick = () => {
          if (travado) return;
          const k = slots.findIndex(s => s && s.i === +b.dataset.i);
          if (k >= 0) slots[k] = null;
          Som.clique();
          desenhar();
        };
      });
      $$('#monte .ord-carta', corpo).forEach(b => { b.onclick = () => colocar(+b.dataset.i); });
      teclasLocais = {};
      resto.forEach((e, k) => { teclasLocais[String(k + 1)] = () => colocar(e.i); });
      botoes();
    }
    function colocar(i) {
      if (travado) return;
      const k = slots.indexOf(null);
      if (k < 0) return;
      slots[k] = evs[i];
      Som.clique();
      desenhar();
    }
    function botoes() {
      const cheio = slots.every(Boolean);
      bandeja([
        { txt: 'Conferir', ico: '✔', cls: 'primario', tecla: 'Enter', fn: conferir, desativado: !cheio },
        { txt: 'Limpar', ico: '↺', fn: () => { slots.fill(null); desenhar(); }, desativado: slots.every(s => !s) },
        '|', bPular()
      ]);
    }
    function conferir() {
      if (travado || !slots.every(Boolean)) return;
      travado = true;
      teclasLocais = {};
      Crono.pausar();
      bandeja([]);
      Som.suspense(0.8);
      setTimeout(() => {
        if (!ctx || ctx.q !== q) return;
        let certos = 0;
        $$('.slot', corpo).forEach((s, k) => {
          const ok = slots[k].i === k;
          if (ok) certos++;
          s.classList.add(ok ? 'certo' : 'errado');
          const c = s.querySelector('.ord-carta');
          c.disabled = true;
          c.insertAdjacentHTML('beforeend', `<small>${slots[k].ref}</small>`);
        });
        $('#monte', corpo).remove();
        if (certos < evs.length) {
          $('#ord-exp', corpo).innerHTML = `<div class="ord-certa revelar-entra">Ordem certa: ${evs.map((e, k) => `<span class="chip">${k + 1}º ${e.emoji} ${e.texto}</span>`).join('')}</div>`;
        }
        const pts = Math.round(certos * porItem);
        concluir(pts, { selo: certos === evs.length ? 'Perfeito!' : `${certos} de ${evs.length}`, seloErro: 'Nenhuma certa' });
      }, Efeitos.reduzir ? 150 : 900);
    }
    desenhar();
    Crono.montar(mod.tempo, { auto: true });
  };

  /* ---------- Cardápio Bíblico */
  /* Cardápio: as opções aparecem direto e o time escolhe (vale os pontos cheios) */
  RENDER.cardapio = function (corpo) {
    const { mod, q } = ctx;
    setValor(mod.pontos);
    const ops = embaralhar(q.opcoes.map((o, i) => ({ html: esc(o), certa: i === 0 })));
    corpo.innerHTML = `
      <div class="menu">
        <div class="menu-folha">
          <div class="menu-cab">Cardápio do dia</div>
          <div class="emoji-grande">${icone(q.arte, q.emoji, 'arte-prato')}</div>
          <h2 class="menu-prato">${q.prato}</h2>
          <p class="menu-desc">${q.descricao}</p>
        </div>
        <div class="menu-lado">
          <h3>Quem comeu isso?</h3>
          <div class="menu-opcoes" id="mops"></div>
          <div id="menu-exp"></div>
        </div>
      </div>`;
    escolhaGenerica({
      box: $('#mops', corpo), opcoes: ops,
      aoRevelar: () => { $('#menu-exp', corpo).innerHTML = explica(q.versiculo, q.curiosidade); }
    });
    Crono.montar(mod.tempo, { auto: true });
  };

  /* ---------- Versículo Embaralhado */
  RENDER.embaralhado = function (corpo) {
    const { mod, q } = ctx;
    setValor(mod.pontos);
    const palavras = q.texto.split(/\s+/).map((p, i) => ({ p, i }));
    let monte = embaralhar(palavras);
    if (monte.every((w, k) => w.i === k)) monte = monte.slice().reverse();
    const linha = [];
    let refMostrada = false;
    let revelado = false;

    corpo.innerHTML = `
      <div class="emb">
        <h2 class="emb-titulo">Montem o versículo <span id="emb-ref"></span></h2>
        <div class="emb-linha" id="linha"></div>
        <div class="emb-monte" id="monte"></div>
        <div id="emb-exp"></div>
      </div>`;

    function desenhar() {
      $('#linha', corpo).innerHTML = linha.map(w => `<button class="palavra" data-i="${w.i}">${w.p}</button>`).join('');
      $('#monte', corpo).innerHTML = monte.filter(w => !linha.includes(w)).map(w => `<button class="palavra" data-i="${w.i}">${w.p}</button>`).join('');
      $$('#linha .palavra', corpo).forEach(b => {
        b.onclick = () => {
          if (revelado) return;
          const k = linha.findIndex(w => w.i === +b.dataset.i);
          if (k >= 0) linha.splice(k, 1);
          desenhar();
        };
      });
      $$('#monte .palavra', corpo).forEach(b => {
        b.onclick = () => {
          if (revelado) return;
          linha.push(palavras[+b.dataset.i]);
          Som.clique();
          desenhar();
        };
      });
    }
    function botoes() {
      if (revelado) return;
      bandeja([
        { txt: 'Revelar', ico: '👀', cls: 'primario', tecla: 'r', fn: revelar },
        !refMostrada ? { txt: `Dica: a referência (vale ${metade(ctx.valor)})`, ico: '💡', cls: 'azul', tecla: 'd', fn: dica } : null,
        bPassar(botoes),
        { txt: 'Limpar', ico: '↺', fn: () => { linha.length = 0; desenhar(); } },
        '|', bPular()
      ]);
    }
    function dica() {
      refMostrada = true;
      setValor(metade(ctx.valor));
      $('#emb-ref', corpo).textContent = `(${q.versiculo})`;
      Som.passar();
      botoes();
    }
    function revelar() {
      revelado = true;
      Crono.pausar();
      let certos = 0;
      $$('#linha .palavra', corpo).forEach((b, k) => {
        const ok = palavras[k] && linha[k].p === palavras[k].p;
        if (ok) certos++;
        b.classList.add(ok ? 'certo' : 'errado');
      });
      $('#monte', corpo).remove();
      /* o próprio jogo dá os pontos: a parte do valor igual à parte das palavras no lugar certo */
      const total = palavras.length;
      const pts = certos === total ? ctx.valor : Math.round(ctx.valor * certos / total / 5) * 5;
      $('#emb-exp', corpo).innerHTML = `<div class="revelar-entra"><p class="emb-certo">${q.texto}</p>
          <p class="emb-placar"><b>${certos} de ${total}</b> palavras no lugar certo · <b>+${pts}</b> pontos</p></div>` + explica(q.versiculo, '');
      Som.revelar();
      bandeja([]);
      setTimeout(() => {
        if (!ctx || ctx.concluida) return;
        concluir(pts, { selo: certos === total ? 'Perfeito!' : `${certos} de ${total}`, seloErro: 'Nenhuma no lugar' });
      }, Efeitos.reduzir ? 150 : 900);
    }
    desenhar();
    botoes();
    Crono.montar(mod.tempo, { auto: true });
  };

  /* ---------- Rodada Relâmpago */
  RENDER.relampago = function (corpo) {
    const { mod, q } = ctx;
    const PTS = mod.pontos;
    setValor(PTS, `<b>${PTS}</b> pontos por acerto`);
    const itens = embaralhar(q.itens);
    const log = [];
    let k = 0, acertos = 0, erros = 0, rodando = false, fim = false;

    corpo.innerHTML = `
      <div class="rel">
        <div class="rel-intro">
          <h3>${q.titulo}</h3>
          <p>Um minuto! Respondam o máximo que conseguirem.<br>Cada acerto vale ${PTS} pontos.</p>
        </div>
      </div>`;
    bandeja([{ txt: 'Começar!', ico: '⚡', cls: 'primario grande', tecla: 'Enter', fn: comecar }, '|', bPular()]);
    Crono.montar(mod.tempo, { forcar: true, aoAcabar: encerrar });
    ctx.limpar = () => { rodando = false; };

    function comecar() {
      rodando = true;
      corpo.innerHTML = `
        <div class="rel">
          <div class="rel-contador"><span class="a">✓ <b id="ra">0</b></span><span class="e">✗ <b id="re">0</b></span></div>
          <p class="rel-pergunta" id="rp"></p>
          <div class="rel-anterior" id="rant"></div>
        </div>`;
      mostrar();
      Crono.iniciar();
      bandeja([
        { txt: 'Acertou', ico: '✓', cls: 'ok grande', tecla: 'a', fn: () => marcar(true) },
        { txt: 'Errou ou pulou', ico: '✗', cls: 'erro grande', tecla: 'e', fn: () => marcar(false) },
        '|', { txt: 'Encerrar', ico: '⏹', fn: encerrar }
      ]);
    }
    function mostrar() {
      const p = $('#rp', corpo);
      p.textContent = itens[k][0];
      p.classList.remove('entra');
      void p.offsetWidth;
      p.classList.add('entra');
    }
    function marcar(ok) {
      if (!rodando || fim) return;
      const [pq, pr] = itens[k];
      log.push({ q: pq, r: pr, ok });
      if (ok) { acertos++; Som.moeda(); } else { erros++; Som.clique(); }
      $('#ra', corpo).textContent = acertos;
      $('#re', corpo).textContent = erros;
      $('#rant', corpo).innerHTML = `${esc(pq)} <b class="${ok ? 'ok' : 'no'}">${ok ? '✓' : '✗'} ${esc(pr)}</b>`;
      k++;
      if (k >= itens.length) encerrar(); else mostrar();
    }
    function encerrar() {
      if (fim) return;
      fim = true;
      rodando = false;
      Crono.pausar();
      teclasLocais = {};
      corpo.innerHTML = `
        <div class="rel">
          <div class="rel-intro"><h3 id="rel-total"></h3><p>Confiram a lista: clique numa pergunta para trocar entre <b>acertou</b> e <b>errou</b>.</p></div>
          <div class="rel-resumo">${log.map((l, i) => `<button type="button" class="rel-item ${l.ok ? 'ok' : 'no'}" data-i="${i}">${esc(l.q)} <b>${esc(l.r)}</b></button>`).join('')}</div>
        </div>`;
      $$('.rel-item', corpo).forEach(b => {
        b.onclick = () => {
          const l = log[+b.dataset.i];
          l.ok = !l.ok;
          b.classList.toggle('ok', l.ok); b.classList.toggle('no', !l.ok);
          Som.clique();
          atualizar();
        };
      });
      atualizar();
    }
    function atualizar() {
      acertos = log.filter(l => l.ok).length;
      $('#rel-total', corpo).textContent = `${acertos} ${acertos === 1 ? 'acerto' : 'acertos'}: ${acertos * PTS} pontos`;
      bandeja([{ txt: `Dar os pontos (${acertos * PTS})`, ico: '✔', cls: 'primario grande', tecla: 'Enter', fn: finalizar }]);
    }
    function finalizar() {
      $$('.rel-item', corpo).forEach(b => { b.disabled = true; });
      concluir(acertos * PTS, { selo: `${acertos} ${acertos === 1 ? 'acerto' : 'acertos'}`, seloErro: 'Nenhum acerto' });
    }
  };

  /* ---------- Complete a Lista */
  function casarItem(txt, itens, achados) {
    const n = normalizar(txt);
    if (!n) return { tipo: 'nada' };
    let cand = [];
    itens.forEach((it, i) => { if (it.alias.some(a => a === n)) cand.push(i); });
    if (!cand.length) {
      itens.forEach((it, i) => {
        if (it.alias.some(a => {
          const lim = a.length >= 9 ? 2 : a.length >= 5 ? 1 : 0;
          return lim > 0 && distancia(a, n, lim) <= lim;
        })) cand.push(i);
      });
    }
    if (!cand.length && n.length >= 4) {
      itens.forEach((it, i) => { if (it.alias.some(a => a.startsWith(n))) cand.push(i); });
    }
    if (!cand.length) {
      itens.forEach((it, i) => { if (it.alias.some(a => a.length >= 4 && (' ' + n + ' ').includes(' ' + a + ' '))) cand.push(i); });
    }
    if (!cand.length) return { tipo: 'nada' };
    const livre = cand.find(i => !achados.has(i));
    if (livre !== undefined) return { tipo: 'novo', i: livre };
    return { tipo: 'ja', i: cand[0] };
  }

  RENDER.lista = function (corpo) {
    const { mod, q } = ctx;
    const PTS = q.pontos || mod.pontos;
    setValor(PTS, `<b>${PTS}</b> pontos por item`);
    const total = q.itens.length;
    const achados = new Set();
    let fim = false;
    const cols = total > 16 ? 7 : total === 10 ? 5 : total > 9 ? 4 : 3;
    const fs = total > 16 ? '1.25rem' : '1.6rem';

    corpo.innerHTML = `
      <div class="lst">
        <div class="lst-cab">
          <h3>${q.titulo}</h3>
          <div class="lst-placar"><span id="lc">0</span> de ${total}</div>
        </div>
        <div class="lst-grade" style="--cols:${cols};--fs:${fs}">${q.itens.map((_, i) => `<div class="lst-item" data-i="${i}">?</div>`).join('')}</div>
        <div class="lst-entrada">
          <input id="li" placeholder="Digite o que o time falar e aperte Enter" autocomplete="off" spellcheck="false" disabled>
          <span class="lst-retorno" id="lr"></span>
        </div>
      </div>`;
    const inp = $('#li', corpo), ret = $('#lr', corpo);

    bandeja([{ txt: 'Começar!', ico: '▶', cls: 'primario', tecla: 'Enter', fn: comecar }, '|', bPular()]);
    Crono.montar(mod.tempo, { forcar: true, aoAcabar: encerrar });

    function comecar() {
      inp.disabled = false;
      inp.focus();
      Crono.iniciar();
      bandeja([
        { txt: 'Pausar ou continuar', ico: '⏯', fn: () => { Crono.alternar(); inp.focus(); } },
        { txt: 'Encerrar', ico: '⏹', fn: encerrar }
      ]);
    }
    inp.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const txt = inp.value;
      inp.value = '';
      if (!txt.trim() || fim) return;
      const r = casarItem(txt, q.itens, achados);
      if (r.tipo === 'novo') {
        achados.add(r.i);
        const it = $(`.lst-item[data-i="${r.i}"]`, corpo);
        it.textContent = q.itens[r.i].nome;
        it.classList.add('achado', 'brilha');
        $('#lc', corpo).textContent = achados.size;
        ret.className = 'lst-retorno ok';
        ret.textContent = '✓ ' + q.itens[r.i].nome;
        Som.moeda();
        if (achados.size === total) encerrar();
      } else if (r.tipo === 'ja') {
        ret.className = 'lst-retorno ja';
        ret.textContent = q.itens[r.i].nome + ' já foi!';
        Som.tique();
      } else {
        ret.className = 'lst-retorno no';
        ret.textContent = '“' + txt.trim() + '” não está na lista';
        Som.tiqueForte();
      }
    });
    function encerrar() {
      if (fim) return;
      fim = true;
      Crono.pausar();
      inp.disabled = true;
      q.itens.forEach((it, i) => {
        if (achados.has(i)) return;
        const e = $(`.lst-item[data-i="${i}"]`, corpo);
        e.textContent = it.nome;
        e.classList.add('faltou');
      });
      ret.className = 'lst-retorno';
      ret.textContent = q.versiculo ? '📖 ' + q.versiculo : '';
      concluir(achados.size * PTS, { selo: `${achados.size} de ${total}`, seloErro: 'Nenhum item' });
    }
  };

  /* ============================================================ TELAS */

  /* ---------- vinheta de abertura (cerca de 13 s; os tempos estão em css/estilo.css) */
  let vinhetaAberta = null;
  function vinheta() {
    if (vinhetaAberta) return;
    fecharModal(); Efeitos.limpar();
    Musica.pausar(true);
    const letras = [...S.titulo].map((c, i) =>
      c === ' ' ? '<span class="vh-espaco"> </span>' : `<span class="vh-letra" style="--i:${i}">${esc(c)}</span>`).join('');
    const time = i => `<span class="vh-time vh-time-${i}" style="${estiloTime(i)}"><b>${S.times[i].emoji}</b>${esc(S.times[i].nome)}</span>`;
    const v = document.createElement('div');
    v.className = 'vinheta';
    v.innerHTML = `
      <div class="vh-raios" aria-hidden="true"></div>
      <div class="vh-brilhos" aria-hidden="true">${Array.from({ length: 26 }, () =>
        `<i style="left:${(Math.random() * 100).toFixed(1)}%;top:${(Math.random() * 100).toFixed(1)}%;--d:${(Math.random() * 2.4).toFixed(2)}s;--s:${(0.5 + Math.random()).toFixed(2)}"></i>`).join('')}</div>
      <div class="vh-conteudo">
        <div class="quadrado vh-quadrado" aria-hidden="true">
          <span class="q1"><i>✝️</i></span><span class="q2"><i>🕊️</i></span>
          <span class="q3"><i>${icone('calice', '🏆', 'arte-emblema')}</i></span><span class="q4"><i>👑</i></span>
        </div>
        <p class="vh-lema">Jesus salva · batiza · cura · vai voltar</p>
        <h1 class="vh-titulo">${letras}</h1>
        ${S.subtitulo ? `<div class="vh-sub">${esc(S.subtitulo)}</div>` : ''}
        <div class="vh-times">${time(0)}<span class="vh-x">×</span>${time(1)}</div>
      </div>
      <div class="vh-final"><span>Que comecem os jogos!</span></div>
      <div class="vh-pular so-mouse">Esc para pular</div>`;
    document.body.appendChild(v);
    const cortarSom = Som.vinheta();
    const timers = [
      setTimeout(() => Efeitos.confete({ x: 0.5, y: 0.55, qtd: 180, forca: 1.15 }), 10950),
      setTimeout(() => { Efeitos.confete({ x: 0.15, y: 0.8 }); Efeitos.confete({ x: 0.85, y: 0.8 }); }, 11300),
      setTimeout(() => fechar(false), 13400)
    ];
    function fechar(pulou) {
      if (vinhetaAberta !== fechar) return;
      vinhetaAberta = null;
      timers.forEach(clearTimeout);
      document.removeEventListener('keydown', tecla, true);
      if (pulou) { cortarSom(); Efeitos.limpar(); }
      v.classList.add('vh-saindo');
      setTimeout(() => v.remove(), 650);
      Musica.pausar(false);
    }
    function tecla(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); fechar(true); }
      else if (e.key === 'f' || e.key === 'F') { e.stopImmediatePropagation(); telaCheia(); }
      else if (e.key !== 'F11') { e.stopImmediatePropagation(); }
    }
    document.addEventListener('keydown', tecla, true);
    vinhetaAberta = fechar;
  }

  function irInicio() {
    limparCtx(); Crono.parar(); fecharModal();
    ctx = null; teclasLocais = {};
    tela('inicio');
    el.placar.innerHTML = '';
    el.palco.innerHTML = `
      <div class="inicio">
        <div class="quadrado" aria-hidden="true">
          <span class="q1"><i>✝️</i></span><span class="q2"><i>🕊️</i></span>
          <span class="q3"><i>${icone('calice', '🏆', 'arte-emblema')}</i></span><span class="q4"><i>👑</i></span>
        </div>
        <div class="inicio-texto">
          <h1>${esc(S.titulo)}</h1>
          <span class="sub">${esc(S.subtitulo)}</span>
          <p class="lema">Dois times, ${MODS.length} jogos diferentes e muita Bíblia. Que vença quem mais aprendeu!</p>
          <p class="credito-biblia">Versículos na Nova Tradução na Linguagem de Hoje (NTLH) © Sociedade Bíblica do Brasil.</p>
          <div class="inicio-botoes">
            ${S.emJogo
              ? '<button class="btn primario grande" id="b-cont">Continuar o jogo</button><button class="btn grande" id="b-novo">Novo jogo</button>'
              : '<button class="btn primario grande" id="b-novo">Montar os times</button>'}
          </div>
        </div>
      </div>`;
    const cont = $('#b-cont');
    if (cont) cont.onclick = () => { Som.clique(); irPainel(); };
    $('#b-novo').onclick = () => {
      Som.clique();
      if (S.emJogo) confirmar('Começar um jogo novo? O placar e as perguntas usadas serão zerados.', () => { novoJogo(); irConfig('inicio'); }, 'Começar do zero');
      else { novoJogo(); irConfig('inicio'); }
    };
    bandeja([
      { txt: 'Tela cheia', ico: '⛶', tecla: 'f', fn: telaCheia },
      { txt: 'Atalhos', ico: '⌨', tecla: '?', fn: ajuda },
      /* só na tela inicial: durante o jogo, abrir o gabarito mostraria as respostas no telão */
      { txt: 'Gabarito para imprimir', ico: '📋', fn: () => window.open('gabarito.html', '_blank') }
    ]);
    teclasLocais = { Enter: () => (cont || $('#b-novo')).click() };
  }

  function irConfig(origem) {
    limparCtx(); Crono.parar(); fecharModal();
    ctx = null; teclasLocais = {};
    tela('config');
    el.placar.innerHTML = '';
    const r = {
      times: S.times.map(t => ({ nome: t.nome, emoji: t.emoji, cor: t.cor, membrosTxt: t.membros.join('\n') })),
      titulo: S.titulo, subtitulo: S.subtitulo, salario: S.salario, tempo: S.tempo, som: S.som, volume: S.volume, musica: S.musica, trilha: S.trilha
    };

    function estilo(cor) { const c = CORES[cor] || CORES.carmesim; return `--c:${c.base};--c-esc:${c.escura};--c-txt:${c.texto}`; }
    function editor(i) {
      const t = r.times[i];
      return `<div class="editor-time" style="${estilo(t.cor)}" data-t="${i}">
        <div class="linha-nome">
          <span class="grande-emoji">${t.emoji}</span>
          <input class="campo-texto" data-nome="${i}" value="${esc(t.nome)}" maxlength="22" aria-label="Nome do time ${i + 1}">
        </div>
        <span class="rotulo">Mascote</span>
        <div class="emojis">${EMOJIS_TIME.map(e => `<button type="button" data-t="${i}" data-e="${e}" aria-pressed="${e === t.emoji}" aria-label="Mascote ${e}">${e}</button>`).join('')}</div>
        <span class="rotulo">Cor</span>
        <div class="amostras">${Object.keys(CORES).map(k => `<button type="button" data-t="${i}" data-c="${k}" style="--a:${CORES[k].base}" aria-pressed="${k === t.cor}" aria-label="Cor ${CORES[k].nome}"></button>`).join('')}</div>
        <label class="rotulo" for="mb${i}">Integrantes <span class="conta-membros" id="cm${i}">${contaMembros(t.membrosTxt)}</span></label>
        <textarea class="campo-texto campo-membros" id="mb${i}" data-membros="${i}" rows="4" placeholder="Um nome por linha&#10;Ana&#10;João&#10;Maria">${esc(t.membrosTxt)}</textarea>
      </div>`;
    }
    function lerMembros(txt) {
      const vistos = new Set(), lista = [];
      String(txt || '').split(/[\n,;]+/).map(n => n.trim().replace(/\s+/g, ' ')).filter(Boolean).forEach(n => {
        const k = n.toLowerCase();
        if (!vistos.has(k)) { vistos.add(k); lista.push(n.slice(0, 24)); }
      });
      return lista;
    }
    function contaMembros(txt) {
      const n = lerMembros(txt).length;
      return n ? `(${n} ${n === 1 ? 'pessoa' : 'pessoas'})` : '(obrigatório)';
    }
    function textoDiaria(sal) {
      return `1 dia de trabalho = salário ÷ 30 = <b>${fmtBRL(diariaDe(sal))}</b>. No “Quanto Vale Hoje?”, 1 denário = 1 dia de trabalho (Mt 20:2).`;
    }
    function seg(k, opcoes) {
      return `<div class="segmentado" data-k="${k}">${opcoes.map(([v, txt]) => `<button type="button" data-v="${v}" aria-pressed="${String(r[k]) === v}">${txt}</button>`).join('')}</div>`;
    }
    function desenhar() {
      /* guarda a rolagem: redesenhar não pode jogar a tela de volta para o topo */
      const antes = $('.config', el.palco), rolagem = antes ? antes.scrollTop : 0;
      el.palco.innerHTML = `
        <div class="config">
          <h2>${origem === 'painel' ? 'Ajustes do jogo' : 'Montem os times'}</h2>
          <div class="config-times">${editor(0)}${editor(1)}</div>
          <div class="cartao config-opcoes">
            <div class="largo"><span class="rotulo">Título na tela</span><input class="campo-texto" id="cf-titulo" value="${esc(r.titulo)}" maxlength="40"></div>
            <div><span class="rotulo">Subtítulo</span><input class="campo-texto" id="cf-sub" value="${esc(r.subtitulo)}" maxlength="40"></div>
            <div>
              <span class="rotulo">Salário mínimo (por mês)</span>
              <div class="campo-reais"><span>R$</span><input class="campo-texto" id="cf-salario" inputmode="decimal" value="${fmtNum(r.salario, 2)}"></div>
              <p class="ajuda-campo" id="cf-diaria-txt">${textoDiaria(r.salario)}</p>
            </div>
            <div><span class="rotulo">Cronômetro</span>${seg('tempo', [['normal', 'Normal'], ['mais', 'Mais tempo'], ['sem', 'Desligado']])}</div>
            <div><span class="rotulo">Sons</span>${seg('som', [['true', 'Ligados'], ['false', 'Desligados']])}</div>
            <div><span class="rotulo">Volume dos sons</span>${seg('volume', [['normal', 'Normal'], ['alto', 'Alto'], ['maximo', 'Máximo']])}<p class="ajuda-campo">Ao trocar, toca um som de teste.</p></div>
            <div><span class="rotulo">Música de fundo</span>${seg('musica', [['desligada', 'Desligada'], ['baixa', 'Baixa'], ['media', 'Média'], ['alta', 'Alta']])}<p class="ajuda-campo">Composta na hora, sem repetir; nas perguntas fica mais baixa. Atalho: N.</p></div>
            <div><span class="rotulo">Trilha sonora</span>${seg('trilha', Object.entries(Musica.TRILHAS))}<p class="ajuda-campo">${r.trilha === 'desenho' ? 'Jazz de desenho animado antigo, com chiado de disco.' : 'Swing animado alternando com eletrônico épico.'} Ao trocar, já começa a tocar.</p></div>
            <div class="inteiro">
              <span class="rotulo">Durante o jogo</span>
              <div class="cf-acoes">
                ${origem === 'painel' ? `<button type="button" class="btn azul" id="cf-vez">⇄ Trocar a vez <span class="cf-dica">agora: ${nomeTime(S.vez)} · tecla V</span></button>
                <button type="button" class="btn azul" id="cf-placar">✏️ Corrigir placar</button>` : ''}
                <button type="button" class="btn claro" id="cf-tela">⛶ Tela cheia <span class="cf-dica">tecla F</span></button>
                <button type="button" class="btn claro" id="cf-atalhos">⌨ Atalhos do teclado <span class="cf-dica">tecla ?</span></button>
              </div>
              ${origem === 'painel' ? `<p class="ajuda-campo">Clicar no placar de um time, no alto da tela, também abre a correção de pontos.</p>
              <div class="cf-acoes cf-encerrar"><button type="button" class="btn erro" id="cf-encerrar">🏁 Encerrar e ver o campeão <span class="cf-dica">pula o que faltar da Aposta Final</span></button></div>` : ''}
            </div>
          </div>
        </div>`;
      const cfg = $('.config', el.palco);
      if (cfg) cfg.scrollTop = rolagem;
      const ligar = (id, fn) => { const b = $('#' + id, el.palco); if (b) b.onclick = fn; };
      ligar('cf-vez', () => { trocarVez(); lerCampos(); desenhar(); });
      ligar('cf-placar', () => { Som.clique(); abrirAjustePlacar(); });
      ligar('cf-tela', () => { Som.clique(); telaCheia(); });
      ligar('cf-atalhos', () => { Som.clique(); ajuda(); });
      /* encerrar descarta os ajustes não salvos (o som volta ao que estava) */
      ligar('cf-encerrar', () => { Som.clique(); confirmar('Encerrar o jogo e mostrar o campeão?', () => { Som.ligado = S.som; Som.nivel = S.volume; Musica.nivel = S.musica; Musica.trilha = S.trilha; irFim(); }, 'Encerrar'); });
      $$('[data-nome]').forEach(inp => { inp.oninput = () => { r.times[+inp.dataset.nome].nome = inp.value; }; });
      $('#cf-salario').oninput = e => {
        const v = lerNumero(e.target.value);
        if (isFinite(v) && v > 0) $('#cf-diaria-txt').innerHTML = textoDiaria(v);
      };
      $$('[data-membros]').forEach(ta => {
        ta.oninput = () => {
          const i = +ta.dataset.membros;
          r.times[i].membrosTxt = ta.value;
          $('#cm' + i).textContent = contaMembros(ta.value);
          ta.closest('.editor-time').classList.remove('faltando');
        };
      });
      $$('.emojis button').forEach(b => { b.onclick = () => { r.times[+b.dataset.t].emoji = b.dataset.e; Som.clique(); lerCampos(); desenhar(); }; });
      $$('.amostras button').forEach(b => {
        b.onclick = () => {
          const i = +b.dataset.t;
          r.times[i].cor = b.dataset.c;
          if (r.times[1 - i].cor === b.dataset.c) aviso('Os dois times estão com a mesma cor.');
          Som.clique(); lerCampos(); desenhar();
        };
      });
      $$('.segmentado').forEach(sg => {
        $$('button', sg).forEach(b => {
          b.onclick = () => {
            const k = sg.dataset.k;
            r[k] = k === 'som' ? b.dataset.v === 'true' : b.dataset.v;
            if (k === 'som') { Som.ligado = r.som; }
            if (k === 'volume') { Som.nivel = r.volume; setTimeout(() => Som.acerto(), 60); }
            if (k === 'musica') { Musica.nivel = r.musica; }
            if (k === 'trilha') { Musica.trilha = r.trilha; if (r.musica === 'desligada') aviso('A música de fundo está desligada.'); }
            Som.clique(); lerCampos(); desenhar();
          };
        });
      });
    }
    function lerCampos() {
      const t = $('#cf-titulo'), s = $('#cf-sub'), d = $('#cf-salario');
      if (t) r.titulo = t.value;
      if (s) r.subtitulo = s.value;
      if (d) { const v = lerNumero(d.value); if (isFinite(v) && v > 0) r.salario = v; }
    }
    function salvarConfig() {
      lerCampos();
      const faltam = r.times.map((t, i) => lerMembros(t.membrosTxt).length ? -1 : i).filter(i => i >= 0);
      if (faltam.length) {
        faltam.forEach(i => { const e = $(`.editor-time[data-t="${i}"]`); if (e) e.classList.add('faltando'); });
        const ed = $(`.editor-time[data-t="${faltam[0]}"] textarea`);
        if (ed) { ed.scrollIntoView({ block: 'center', behavior: 'smooth' }); ed.focus(); }
        aviso('Escreva os nomes dos integrantes de cada time (um por linha).', 3200);
        Som.erro();
        return;
      }
      r.times.forEach((t, i) => {
        S.times[i].nome = (t.nome || '').trim() || `Time ${i + 1}`;
        S.times[i].emoji = t.emoji;
        S.times[i].cor = t.cor;
        S.times[i].membros = lerMembros(t.membrosTxt);
        S.times[i].jogaram = S.times[i].jogaram.filter(n => S.times[i].membros.includes(n));
      });
      S.jogadores = [null, null];
      S.titulo = r.titulo.trim() || 'Quiz Bíblico da EBD';
      S.subtitulo = r.subtitulo.trim();
      S.salario = r.salario;
      S.tempo = r.tempo;
      S.som = r.som;
      Som.ligado = S.som;
      S.volume = r.volume;
      Som.nivel = S.volume;
      S.musica = r.musica;
      Musica.nivel = S.musica;
      S.trilha = r.trilha;
      Musica.trilha = S.trilha;
      salvar();
      irPainel();
      /* times montados: a vinheta de abertura passa por cima e, quando acaba, já está o painel dos jogos */
      if (origem !== 'painel') vinheta();
    }
    desenhar();
    bandeja([
      { txt: origem === 'painel' ? 'Voltar sem salvar' : 'Voltar', ico: '←', fn: () => { Som.ligado = S.som; Som.nivel = S.volume; Musica.nivel = S.musica; Musica.trilha = S.trilha; if (origem === 'painel') irPainel(); else irInicio(); } },
      origem === 'painel' ? { txt: 'Recomeçar do zero', ico: '🔄', cls: 'erro', fn: () => confirmar('Zerar o placar e liberar todas as perguntas de novo?', () => { novoJogo(); irPainel(); }, 'Recomeçar') } : null,
      '|',
      { txt: origem === 'painel' ? 'Salvar ajustes' : 'Começar o jogo', ico: '▶', cls: 'primario', tecla: 'Enter', fn: salvarConfig }
    ]);
  }

  function trocarVez() {
    S.vez = 1 - S.vez;
    salvar();
    destacarVez(S.vez);
    Som.passar();
    aviso(`Agora é a vez de ${S.times[S.vez].emoji} ${S.times[S.vez].nome}`);
  }

  function irPainel() {
    limparCtx(); Crono.parar(); fecharModal();
    ctx = null; teclasLocais = {};
    tela('painel');
    renderPlacar(`<div class="centro-titulo"><h1>${esc(S.titulo)}</h1>${S.subtitulo ? `<p>${esc(S.subtitulo)}</p>` : ''}</div>`);
    destacarVez(S.vez);
    const tiles = MODS.map(m => {
      /* cada rodada usa duas perguntas: uma para cada equipe */
      const r = Math.floor(restantes(m.id) / 2);
      return `<button class="modulo ${classeCor(m)} ${r ? '' : 'esgotado'}" data-m="${m.id}" ${r ? '' : 'disabled'}>
        <span class="mod-icone" aria-hidden="true">${m.icone}</span>
        <span class="mod-texto"><span class="mod-nome">${m.nome}</span><span class="mod-desc">${m.descricao}</span></span>
        <span class="mod-resta">${r ? `${r} ${r === 1 ? 'rodada' : 'rodadas'}` : 'acabou'}</span>
      </button>`;
    }).join('');
    el.palco.innerHTML = `<div class="grade">${tiles}
      <button class="modulo final" id="m-final">
        ${(S.finalRodada || 0) < RODADAS_FINAL ? `<span class="mod-resta">${RODADAS_FINAL - (S.finalRodada || 0)} ${RODADAS_FINAL - (S.finalRodada || 0) === 1 ? 'rodada' : 'rodadas'}</span>` : '<span class="mod-resta">concluída</span>'}
        <span class="mod-icone" aria-hidden="true">🏆</span>
        <span class="mod-texto"><span class="mod-nome">Aposta Final</span><span class="mod-desc">Duas rodadas de tudo ou nada, com representantes sorteados.</span></span>
      </button></div>`;
    $$('.modulo[data-m]').forEach(b => { b.onclick = () => { Som.clique(); abrirModulo(b.dataset.m); }; });
    $('#m-final').onclick = () => { Som.clique(); abrirFinal(); };
    bandeja([
      { txt: 'Girar a roleta', cls: 'primario', tecla: 'Enter', fn: abrirRoleta },
      '|',
      { txt: 'Ajustes', ico: '⚙️', fn: () => irConfig('painel') },
    ]);
    /* trocar a vez, corrigir placar, tela cheia, atalhos e encerrar ficam nos Ajustes; o V continua trocando a vez */
    teclasLocais = { v: trocarVez };
  }

  /* ---------- roleta */
  let rotRoleta = 0;
  function abrirRoleta() {
    const disp = MODS.filter(m => restantes(m.id) >= 2);
    if (!disp.length) { aviso('Todos os jogos acabaram! Hora da Aposta Final.'); return; }
    const n = disp.length;
    const seg = 360 / n;
    const R = 500;
    const pt = (ang, r) => {
      const a = (ang - 90) * Math.PI / 180;
      return [(Math.cos(a) * r).toFixed(1), (Math.sin(a) * r).toFixed(1)];
    };
    const fatias = disp.map((m, i) => {
      const a0 = i * seg, a1 = (i + 1) * seg, meio = a0 + seg / 2;
      const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R), [xe, ye] = pt(meio, R * 0.74);
      const cor = getComputedStyle(document.documentElement).getPropertyValue('--' + CORES_MOD[i % 4]).trim();
      const d = n === 1 ? `M0 ${-R} A${R} ${R} 0 1 1 -0.1 ${-R} Z` : `M0 0 L${x0} ${y0} A${R} ${R} 0 ${seg > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
      return `<path class="fatia" data-i="${i}" d="${d}" fill="${cor}" stroke="#1B0F36" stroke-width="6"/>
        <text x="${xe}" y="${ye}" text-anchor="middle" dominant-baseline="central" font-size="${n > 12 ? 70 : 88}" transform="rotate(${meio.toFixed(1)} ${xe} ${ye})">${m.icone}</text>`;
    }).join('');
    const vez = S.times[S.vez];
    /* em camadas: a base (com a sombra) fica parada; só os gomos giram, numa camada
       que a placa de vídeo move sem redesenhar (giro liso, sem travar) */
    abrirModal(`<div class="roleta">
      <div class="roda-caixa roda-jogos">
        <div class="ponteiro"></div>
        <div class="roda-base"></div>
        <svg class="roda-giro" id="roda" viewBox="-530 -530 1060 1060" aria-hidden="true" style="transform:rotate(${rotRoleta}deg)">${fatias}</svg>
        <svg class="roda-centro" viewBox="-530 -530 1060 1060" aria-hidden="true">
          <circle r="120" fill="#1B0F36" stroke="#FFF6E3" stroke-width="12"/>
          <text y="6" text-anchor="middle" dominant-baseline="central" font-size="120">${vez.emoji}</text>
        </svg>
      </div>
      <div class="roleta-lado">
        <h2>Roleta da Bíblia</h2>
        <p>Vez de ${nomeTime(S.vez)}. Girem para sortear o próximo jogo!</p>
        <div id="sorteado"></div>
        <div class="modal-acoes" style="justify-content:flex-start">
          <button class="btn primario grande" id="girar">Girar!</button>
          <button class="btn" id="fechar-roleta">Fechar</button>
        </div>
      </div></div>`);
    const roda = $('#roda');
    $('#fechar-roleta').onclick = fecharModal;
    $('#girar').onclick = girar;
    teclasModal.Enter = girar;
    teclasModal[' '] = girar;
    let girando = false;

    function girar() {
      if (girando) return;
      girando = true;
      travaModal = true;
      $('#girar').disabled = true;
      $('#fechar-roleta').disabled = true;
      $('#sorteado').innerHTML = '';
      const alvo = Math.floor(Math.random() * n);
      const c = (alvo + 0.5) * seg;
      const jitter = (Math.random() - 0.5) * seg * 0.6;
      const base = ((360 - c - rotRoleta) % 360 + 360) % 360;
      const inicio = rotRoleta;
      const fimRot = rotRoleta + 360 * 6 + base + jitter;
      const dur = Efeitos.reduzir ? 300 : 4800;
      /* o navegador anima o giro sozinho (liso); aqui só se acompanha o ângulo para o "tic" */
      const anim = roda.animate([{ transform: `rotate(${inicio}deg)` }, { transform: `rotate(${fimRot}deg)` }],
        { duration: dur, easing: 'cubic-bezier(0.12, 0.75, 0.2, 1)', fill: 'forwards' });
      let ultimoSeg = Math.floor(inicio / seg), acabou = false;
      function quadro() {
        if (acabou) return;
        const pr = anim.effect.getComputedTiming().progress;
        if (pr != null) {
          const s = Math.floor((inicio + (fimRot - inicio) * pr) / seg);
          if (s !== ultimoSeg) { ultimoSeg = s; Som.giro(); }
        }
        requestAnimationFrame(quadro);
      }
      requestAnimationFrame(quadro);
      function parou() {
        if (acabou) return;
        acabou = true;
        roda.style.transform = `rotate(${fimRot}deg)`;
        anim.cancel();
        rotRoleta = fimRot % 360;
        const m = disp[alvo];
        Som.revelar();
        const fatia = $(`.fatia[data-i="${alvo}"]`, roda);
        if (fatia) fatia.classList.add('vencedora');
        $('#sorteado').innerHTML = `<div class="roleta-sorteado"><span>${m.icone}</span>${m.nome}</div>`;
        /* transição: a roleta afunda e some, e a roleta de nomes entra crescendo */
        setTimeout(() => { const r = $('.roleta', el.sobre); if (r) r.classList.add('saindo'); }, 1300);
        setTimeout(() => { travaModal = false; abrirModulo(m.id); }, 1750);
      }
      anim.finished.then(parou, () => {});
      /* garantia: se o navegador pausar a animação, o sorteio termina mesmo assim */
      setTimeout(parou, dur + 400);
    }
  }

  /* ---------- Aposta Final: 2 rodadas, cada uma com um representante sorteado por time */
  const RODADAS_FINAL = 2;
  function representantesFinal(rodada, evitar) {
    const antes = rodada > 1 ? (S.finalReps || [])[rodada - 2] || [] : [];
    return [0, 1].map(i => {
      const m = S.times[i].membros.length ? S.times[i].membros : [S.times[i].nome];
      let livres = m.filter(n => n !== antes[i] && !(evitar && n === evitar[i]));
      if (!livres.length) livres = m.filter(n => n !== antes[i]);
      if (!livres.length) livres = m.slice();
      return livres[Math.floor(Math.random() * livres.length)];
    });
  }

  /* tema da rodada: sorteado entre os que ainda não foram usados */
  function temaFinal(evitar) {
    const usadas = S.usadas.final || [];
    const todos = DADOS.final.map((_, i) => i);
    let livres = todos.filter(i => !usadas.includes(i) && i !== evitar);
    if (!livres.length) livres = todos.filter(i => !usadas.includes(i));
    if (!livres.length) livres = todos;
    return livres[Math.floor(Math.random() * livres.length)];
  }

  /* cinemática do sorteio dos representantes e do tema (≈ 17 s; tempos em css/estilo.css e em Som.sorteioFinal) */
  function cinematicaSorteio(rodada, reps, tema, aoFim) {
    if (Efeitos.reduzir || vinhetaAberta) {
      aviso(`Representantes: ${S.times[0].emoji} ${reps[0]} × ${S.times[1].emoji} ${reps[1]} · Tema: ${DADOS.final[tema].tema}`, 4000);
      aoFim(); return;
    }
    fecharModal(); Efeitos.limpar();
    Musica.pausar(true);
    /* rolos: 0 e 1 os representantes, 2 o tema */
    const INICIO = [2300, 2300, 10600], PARA = [7000, 9000, 14200], FECHA = 17500;
    /* cada rolo: nomes embaralhados, terminando no representante (com um nome depois dele) */
    const rolos = [0, 1].map(i => {
      const m = S.times[i].membros.length ? S.times[i].membros : [S.times[i].nome];
      const total = Math.max(26, m.length * 8);
      const lista = [];
      for (let k = 0; k < total; k++) {
        let n = m[Math.floor(Math.random() * m.length)];
        if (m.length > 1) while (n === lista[k - 1]) n = m[Math.floor(Math.random() * m.length)];
        lista.push(n);
      }
      lista[total - 2] = reps[i];
      if (m.length > 1 && lista[total - 3] === reps[i]) lista[total - 3] = m.find(n => n !== reps[i]);
      if (m.length > 1 && lista[total - 1] === reps[i]) lista[total - 1] = m.find(n => n !== reps[i]);
      return lista;
    });
    {
      const nomes = DADOS.final.map(x => x.tema), lista = [];
      for (let k = 0; k < 22; k++) {
        let n = nomes[Math.floor(Math.random() * nomes.length)];
        while (nomes.length > 1 && n === lista[k - 1]) n = nomes[Math.floor(Math.random() * nomes.length)];
        lista.push(n);
      }
      const alvoT = DADOS.final[tema].tema;
      lista[20] = alvoT;
      if (nomes.length > 1) [19, 21].forEach(k => { if (lista[k] === alvoT) lista[k] = nomes.find(n => n !== alvoT); });
      rolos.push(lista);
    }
    const c = document.createElement('div');
    c.className = 'vinheta sorteio-final';
    c.innerHTML = `
      <div class="vh-raios" aria-hidden="true"></div>
      <div class="cn-holofote cn-h0" aria-hidden="true"></div><div class="cn-holofote cn-h1" aria-hidden="true"></div>
      <div class="sf-conteudo">
        <div class="sf-selo">🏆 Aposta Final · ${rodada}ª rodada de ${RODADAS_FINAL}</div>
        <h1 class="sf-titulo">Quem vai representar cada time?</h1>
        <div class="sf-times">${[0, 1].map(i => `
          ${i ? '<div class="sf-x">×</div>' : ''}
          <div class="sf-time sf-t${i}" style="${estiloTime(i)}">
            <div class="sf-cab">${nomeTime(i)}</div>
            <div class="sf-visor">
              <div class="sf-janela"><div class="sf-rolo" id="sf-r${i}">${rolos[i].map((n, k) => `<div class="sf-nome${k === rolos[i].length - 2 ? ' alvo' : ''}">${esc(n)}</div>`).join('')}</div></div>
              <div class="sf-moldura" aria-hidden="true"></div>
            </div>
          </div>`).join('')}
        </div>
        <div class="sf-base">
          <div class="sf-faixa"><span>Os representantes!</span></div>
          <div class="sf-tema">
            <div class="sf-tema-rot">E o tema é…</div>
            <div class="sf-visor">
              <div class="sf-janela"><div class="sf-rolo" id="sf-r2">${rolos[2].map((n, k) => `<div class="sf-nome${k === 20 ? ' alvo' : ''}">${esc(n)}</div>`).join('')}</div></div>
              <div class="sf-moldura" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="vh-pular so-mouse">Esc para pular</div>`;
    document.body.appendChild(c);
    const cortarSom = Som.sorteioFinal();
    const timers = [];
    const parados = [false, false, false];
    /* gira um rolo com o freio de caça-níquel e um "tic" a cada nome que passa */
    /* posição que deixa o nome sorteado no meio da janela (medida na hora, pelo próprio nome) */
    function alvoY(rolo) {
      const el = $('.alvo', rolo), jan = rolo.parentElement;
      return el.offsetTop - (jan.clientHeight - el.offsetHeight) / 2;
    }
    function girar(i) {
      const rolo = $('#sf-r' + i, c);
      const h = rolo.firstElementChild.offsetHeight || 80;
      const fimY = alvoY(rolo), dur = PARA[i] - INICIO[i], t0 = performance.now();
      let ult = 0;
      function quadro(agora) {
        if (parados[i] || !rolo.isConnected) return;
        const p = Math.min(1, (agora - t0) / dur);
        const y = fimY * (1 - Math.pow(1 - p, 3.2));
        rolo.style.transform = `translateY(${-y}px)`;
        const k = Math.floor(y / h);
        if (k !== ult) { ult = k; if (i !== 0 || !parados[1]) Som.giro(); }
        if (p < 1) requestAnimationFrame(quadro);
      }
      requestAnimationFrame(quadro);
      return () => { rolo.style.transform = `translateY(${-alvoY(rolo)}px)`; };
    }
    const fixar = [null, null, null];
    [0, 1, 2].forEach(i => {
      timers.push(setTimeout(() => { fixar[i] = girar(i); }, INICIO[i]));
      timers.push(setTimeout(() => {
        parados[i] = true;
        if (fixar[i]) fixar[i]();
        $(i < 2 ? '.sf-t' + i : '.sf-tema', c).classList.add('parou');
        if (i < 2) Efeitos.confete({ x: i ? 0.72 : 0.28, y: 0.55, qtd: 60 });
        else {
          Efeitos.confete({ x: 0.5, y: 0.7, qtd: 200, forca: 1.2 });
          timers.push(setTimeout(() => { Efeitos.confete({ x: 0.15, y: 0.8 }); Efeitos.confete({ x: 0.85, y: 0.8 }); }, 500));
        }
      }, PARA[i]));
    });
    timers.push(setTimeout(() => fechar(false), FECHA));
    function fechar(pulou) {
      if (vinhetaAberta !== fechar) return;
      vinhetaAberta = null;
      timers.forEach(clearTimeout);
      parados.fill(true);
      document.removeEventListener('keydown', tecla, true);
      if (pulou) { cortarSom(); Efeitos.limpar(); }
      c.classList.add('vh-saindo');
      setTimeout(() => c.remove(), 650);
      Musica.pausar(false);
      aoFim();
    }
    function tecla(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); fechar(true); }
      else if (e.key === 'f' || e.key === 'F') { e.stopImmediatePropagation(); telaCheia(); }
      else if (e.key !== 'F11') { e.stopImmediatePropagation(); }
    }
    document.addEventListener('keydown', tecla, true);
    vinhetaAberta = fechar;
  }

  function abrirFinal() {
    limparCtx(); Crono.parar(); fecharModal();
    ctx = null; teclasLocais = {};
    const feitas = S.finalRodada || 0;
    const rodada = Math.min(feitas + 1, RODADAS_FINAL);
    tela('final');
    renderPlacar(`<div class="centro-pergunta">
        <div class="chip-mod" style="--m:var(--noite-3);--m-esc:#120827;--m-txt:var(--ouro)">🏆 Aposta Final</div>
        <div class="vale">${feitas >= RODADAS_FINAL ? 'Concluída!' : `${rodada}ª rodada de ${RODADAS_FINAL} · tudo ou nada!`}</div>
        <button class="cronometro" id="cronometro" hidden aria-label="Cronômetro"></button>
      </div>`);
    if (feitas >= 1) esconderPlacar();
    destacarVez(-1);
    el.palco.innerHTML = '<section class="cartao cartao-pergunta"><div class="cp-corpo"></div></section>';
    const corpo = $('.cp-corpo', el.palco);
    const usadas = S.usadas.final || [];
    const apostas = [0, 0];
    const maximo = i => Math.max(S.times[i].pontos, 100);
    let f = null, fi = -1;
    S.finalReps = S.finalReps || [];
    S.finalTemas = S.finalTemas || [];
    const reps = () => S.finalReps[rodada - 1];
    const quem = i => `${nomeTime(i)}<span class="fin-rep">representado por <b>${esc(reps()[i])}</b></span>`;

    /* as duas rodadas já foram jogadas */
    if (feitas >= RODADAS_FINAL) {
      corpo.innerHTML = `<div class="fin"><h2 class="fin-titulo">Aposta Final concluída</h2>
        <p class="fin-sub">As ${RODADAS_FINAL} rodadas já foram jogadas. Hora de conhecer o campeão!</p></div>`;
      bandeja([{ txt: 'Ver o campeão', ico: '🏆', cls: 'primario grande', tecla: 'Enter', fn: irFim }]);
      return;
    }
    /* representantes e tema já sorteados (saiu para o painel no meio): continua nas apostas */
    if (reps() && S.finalTemas[rodada - 1] != null) usarTema();
    else sortear();

    function usarTema() {
      fi = S.finalTemas[rodada - 1];
      f = DADOS.final[fi];
      passoApostas();
    }

    function sortear(evitar) {
      S.finalReps[rodada - 1] = representantesFinal(rodada, evitar && evitar.reps);
      S.finalTemas[rodada - 1] = temaFinal(evitar && evitar.tema);
      salvar();
      corpo.innerHTML = '';
      bandeja([]);
      cinematicaSorteio(rodada, reps(), S.finalTemas[rodada - 1], usarTema);
    }

    function passoApostas() {
      corpo.innerHTML = `
        <div class="fin">
          <span class="chip" style="align-self:center">${rodada}ª rodada · tema sorteado</span>
          <h2 class="fin-titulo">${f.tema}</h2>
          <div class="fin-reps">${[0, 1].map(i => `<div class="fin-rep-time" style="${estiloTime(i)}">${S.times[i].emoji} <b>${esc(reps()[i])}</b><span>${esc(S.times[i].nome)}</span></div>`).join('<span class="fin-x">×</span>')}</div>
          <p class="fin-sub">Quanto cada time aposta? Acertou, ganha a aposta; errou, perde. Combinem em segredo e digitem aqui.</p>
          <div class="apostas">${[0, 1].map(i => `
            <div class="aposta-time" style="${estiloTime(i)}">
              <div class="nome">${nomeTime(i)}</div>
              <div class="tem">Tem ${fmtInt(S.times[i].pontos)} pontos e pode apostar até ${fmtInt(maximo(i))}.</div>
              <input type="number" id="ap${i}" min="0" max="${maximo(i)}" step="10" value="${apostas[i]}" aria-label="Aposta de ${esc(S.times[i].nome)}">
              <div class="rapidos">
                <button class="btn claro" data-i="${i}" data-q="0">Nada</button>
                <button class="btn claro" data-i="${i}" data-q="0.5">Metade</button>
                <button class="btn claro" data-i="${i}" data-q="1">Tudo</button>
              </div>
            </div>`).join('')}
          </div>
        </div>`;
      $$('.rapidos .btn', corpo).forEach(b => {
        b.onclick = () => {
          const i = +b.dataset.i;
          $('#ap' + i, corpo).value = Math.round(maximo(i) * +b.dataset.q);
        };
      });
      $$('input', corpo).forEach(inp => { inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); confirmarApostas(); } }); });
      bandeja([
        { txt: 'Sortear de novo', ico: ICO_SORTEAR, cls: 'azul', fn: () => sortear({ reps: reps(), tema: fi }) },
        '|',
        { txt: 'Confirmar apostas', ico: '✔', cls: 'primario', tecla: 'Enter', fn: confirmarApostas }
      ]);
    }

    function confirmarApostas() {
      [0, 1].forEach(i => {
        const v = Math.round(+($('#ap' + i, corpo).value) || 0);
        apostas[i] = Math.max(0, Math.min(maximo(i), v));
      });
      S.usadas.final = usadas.concat(fi);
      salvar();
      passoPergunta();
    }

    function passoPergunta() {
      corpo.innerHTML = `
        <div class="fin">
          <span class="chip" style="align-self:center">${f.tema}</span>
          <p class="fin-pergunta">${f.pergunta}</p>
          <p class="fin-sub">✍️ ${esc(reps()[0])} e ${esc(reps()[1])}: escrevam a resposta num papel, sem o outro time ver.</p>
        </div>`;
      Som.revelar();
      Crono.montar(60, { forcar: true, auto: true });
      bandeja([{ txt: 'Revelar a resposta', ico: '👀', cls: 'primario', tecla: 'r', fn: passoResposta }]);
    }

    function passoResposta() {
      Crono.pausar();
      const res = [null, null];
      corpo.innerHTML = `
        <div class="fin">
          <p class="fin-pergunta" style="font-size:1.8rem">${f.pergunta}</p>
          <div class="fin-resposta revelar-entra"><div class="resposta-revelada">${f.resposta}</div>${explica(f.versiculo, '')}</div>
          <div class="apostas">${[0, 1].map(i => `
            <div class="aposta-time" style="${estiloTime(i)}" id="pa${i}">
              <div class="nome">${quem(i)}</div>
              <div class="aposta-valor">aposta ${fmtInt(apostas[i])}</div>
              <div class="resultado">
                <button class="btn claro" data-i="${i}" data-r="1" aria-pressed="false">✓ Acertou</button>
                <button class="btn claro" data-i="${i}" data-r="0" aria-pressed="false">✗ Errou</button>
              </div>
            </div>`).join('')}
          </div>
        </div>`;
      Som.revelar();
      $$('.resultado .btn', corpo).forEach(b => {
        b.onclick = () => {
          const i = +b.dataset.i;
          res[i] = b.dataset.r === '1';
          $$(`.resultado .btn[data-i="${i}"]`, corpo).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
          Som.clique();
          botoes();
        };
      });
      function botoes() {
        bandeja([{ txt: 'Aplicar o resultado', ico: '✔', cls: 'primario', tecla: 'Enter', fn: aplicar, desativado: res.includes(null) }]);
      }
      function aplicar() {
        if (res.includes(null)) return;
        bandeja([]);
        [0, 1].forEach((i, k) => {
          const delta = res[i] ? apostas[i] : -apostas[i];
          setTimeout(() => darPontos(i, delta, `Aposta final (${rodada}ª rodada)`, $('#pa' + i, corpo)), k * 500);
        });
        S.finalRodada = rodada;
        salvar();
        if (res.includes(true)) { Som.acerto(); Efeitos.confete(); } else Som.erro();
        setTimeout(() => {
          bandeja(rodada < RODADAS_FINAL
            ? [{ txt: `Ir para a ${rodada + 1}ª rodada`, ico: '▶', cls: 'primario grande', tecla: 'Enter', fn: abrirFinal }]
            : [{ txt: 'Ver o campeão', ico: '🏆', cls: 'primario grande', tecla: 'Enter', fn: irFim }]);
        }, 1500);
      }
      botoes();
    }
  }

  /* ---------- Fim */
  /* Hino do campeão: se houver um arquivo musica/campeao.mp3 (ou .m4a, .ogg, .wav) na pasta
     do jogo, ele toca na revelação no lugar da fanfarra. */
  const hino = { audio: null, pronto: false };
  function prepararHino() {
    if (hino.audio) return;
    const tipos = ['mp3', 'm4a', 'ogg', 'wav'];
    const au = new Audio();
    au.preload = 'auto';
    au.volume = 0.9;
    let k = 0;
    au.addEventListener('canplaythrough', () => { hino.pronto = true; });
    au.addEventListener('error', () => { if (++k < tipos.length) au.src = 'musica/campeao.' + tipos[k]; });
    au.addEventListener('ended', () => Musica.pausar(false));
    au.src = 'musica/campeao.' + tipos[0];
    hino.audio = au;
  }
  function tocarHino() {
    if (!hino.pronto || !S.som) return false;
    Musica.pausar(true);
    hino.audio.currentTime = 0;
    hino.audio.volume = 0.9;
    const p = hino.audio.play();
    if (p && p.catch) p.catch(() => {});
    return true;
  }
  const hinoTocando = () => !!(hino.audio && !hino.audio.paused && !hino.audio.ended);
  function pararHinoJa() { if (hinoTocando()) hino.audio.pause(); }
  function pararHino() {
    if (!hinoTocando()) return;
    const au = hino.audio;
    let v = au.volume;
    const t = setInterval(() => {
      v -= 0.08;
      if (v <= 0) { clearInterval(t); au.pause(); Musica.pausar(false); } else au.volume = v;
    }, 60);
  }

  /* ---------- cinemática do campeão (≈ 20 s; os tempos estão em css/estilo.css e em Som.campeao) */
  function cinematica(aoFim) {
    if (Efeitos.reduzir || vinhetaAberta) { Musica.pausar(false); aoFim(true); return; }
    fecharModal(); Efeitos.limpar();
    Musica.pausar(true);
    const [a, b] = S.times;
    const empate = a.pontos === b.pontos, v = a.pontos > b.pontos ? 0 : 1;
    const papel = i => empate ? 'cn-empata' : i === v ? 'cn-vence' : 'cn-perde';
    const cartao = i => `<div class="cn-time cn-t${i} ${papel(i)}" style="${estiloTime(i)}">
        ${!empate && i === v ? '<div class="cn-coroa" aria-hidden="true">👑</div>' : ''}
        <div class="cn-emoji">${S.times[i].emoji}</div>
        <div class="cn-nome">${esc(S.times[i].nome)}</div>
        <div class="cn-pontos" id="cn-p${i}">0</div>
      </div>`;
    const c = document.createElement('div');
    c.className = 'vinheta cine' + (empate ? ' cn-empate' : '');
    c.innerHTML = `
      <div class="vh-raios" aria-hidden="true"></div>
      <div class="cn-holofote cn-h0" aria-hidden="true"></div><div class="cn-holofote cn-h1" aria-hidden="true"></div><div class="cn-holofote cn-h2" aria-hidden="true"></div>
      <div class="cn-conteudo">
        <p class="cn-pergunta">${empate ? 'E o resultado final é' : 'E o grande campeão é'}<span class="cn-pontinhos">...</span></p>
        <div class="cn-times">${cartao(0)}<div class="cn-x"><span class="cn-x1">×</span>${empate ? '<span class="cn-x2">🤝</span>' : ''}</div>${cartao(1)}</div>
        <div class="cn-faixa"><span>${empate ? 'Empate!' : 'Campeões!'}</span></div>
      </div>
      <div class="cn-escuro" aria-hidden="true"></div><div class="cn-flash" aria-hidden="true"></div>
      <div class="vh-pular so-mouse">Esc para pular</div>`;
    document.body.appendChild(c);
    const cortarSom = Som.campeao(empate);
    const REVELA = 13400;
    let revelado = false;
    const pontos = [a.pontos, b.pontos], menor = Math.min(a.pontos, b.pontos);
    const cartoes = [$('.cn-t0', c), $('.cn-t1', c)];
    /* 2,6 – 8,6 s: os dois placares sobem juntos e travam empatados no placar do perdedor */
    const timers = [0, 1].map(i => setTimeout(() => {
      const el = $('#cn-p' + i, c);
      if (el) Efeitos.contar(el, 0, menor, 6000, fmtInt);
    }, 2600));
    /* 8,6 – 12,6 s: a luz pula de um time para o outro, cada vez mais rápido */
    let lado = 0, quando = 8600, passo = 460;
    while (quando < 12500) {
      const l = lado;
      timers.push(setTimeout(() => {
        cartoes.forEach((k, i) => { k.classList.toggle('cn-luz', i === l); k.classList.toggle('cn-apagado', i !== l); });
        Som.tique();
      }, quando));
      quando += passo; passo = Math.max(70, passo * 0.86); lado = 1 - lado;
    }
    timers.push(
      setTimeout(() => cartoes.forEach(k => k.classList.remove('cn-luz', 'cn-apagado')), 12600),
      /* 13,4 s: a revelação; o placar do vencedor dispara até o valor final */
      setTimeout(() => {
        revelado = true;
        if (!empate) Efeitos.contar($('#cn-p' + v, c), menor, pontos[v], 900, fmtInt);
        if (!tocarHino()) Som.fanfarraCampeao(empate);
      }, REVELA),
      setTimeout(() => Efeitos.confete({ x: 0.5, y: 0.45, qtd: 200, forca: 1.2 }), REVELA + 100),
      setTimeout(() => { Efeitos.confete({ x: 0.15, y: 0.8 }); Efeitos.confete({ x: 0.85, y: 0.8 }); }, REVELA + 700),
      setTimeout(() => Efeitos.chuva(), REVELA + 1400),
      setTimeout(() => fechar(false), REVELA + 6200)
    );
    function fechar(pulou) {
      if (vinhetaAberta !== fechar) return;
      vinhetaAberta = null;
      timers.forEach(clearTimeout);
      document.removeEventListener('keydown', tecla, true);
      if (pulou) { cortarSom(); Efeitos.limpar(); }
      c.classList.add('vh-saindo');
      setTimeout(() => c.remove(), 650);
      /* se o hino está tocando, a música de fundo só volta quando ele acabar */
      if (!hinoTocando()) Musica.pausar(false);
      aoFim(pulou && !revelado);
    }
    function tecla(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); fechar(true); }
      else if (e.key === 'f' || e.key === 'F') { e.stopImmediatePropagation(); telaCheia(); }
      else if (e.key !== 'F11') { e.stopImmediatePropagation(); }
    }
    document.addEventListener('keydown', tecla, true);
    vinhetaAberta = fechar;
  }

  function irFim(semCinema) {
    limparCtx(); Crono.parar(); fecharModal();
    ctx = null; teclasLocais = {};
    if (semCinema !== true) Musica.pausar(true);
    prepararHino();
    tela('fim');
    renderPlacar(`<div class="centro-titulo"><h1>${esc(S.titulo)}</h1><p>Fim de jogo</p></div>`);
    const [a, b] = S.times;
    const empate = a.pontos === b.pontos;
    const v = a.pontos > b.pontos ? 0 : 1;
    destacarVez(empate ? -1 : v);
    if (!empate) $(`.time-${v} .time-vez`, el.placar).textContent = 'Campeão!';
    el.palco.innerHTML = `
      <div class="fim">
        <div class="trofeu">${empate ? '🤝' : '🏆'}</div>
        <h1 class="vencedor">${empate ? 'Empate!' : nomeTime(v)}</h1>
        <div class="placar-final">${nomeTime(0)} <b>${fmtInt(a.pontos)}</b> &nbsp;×&nbsp; <b>${fmtInt(b.pontos)}</b> ${nomeTime(1)}</div>
        <blockquote class="versiculo-final">“Jesus Cristo é o mesmo ontem, hoje e sempre.”<cite>Hebreus 13:8</cite></blockquote>
        <p class="credito-biblia">Textos bíblicos: Nova Tradução na Linguagem de Hoje (NTLH) © 2000 Sociedade Bíblica do Brasil.</p>
      </div>`;
    function festa() {
      Som.fanfarra();
      Efeitos.chuva();
      setTimeout(() => Efeitos.confete({ x: 0.25, y: 0.6 }), 700);
      setTimeout(() => Efeitos.confete({ x: 0.75, y: 0.6 }), 1200);
    }
    /* a cinemática já comemora; se pularem antes da revelação, comemora aqui */
    const revelar = () => { pararHinoJa(); cinematica(pulou => { if (pulou && !hinoTocando() && !tocarHino()) festa(); }); };
    if (semCinema === true) festa(); else revelar();
    bandeja([
      { txt: 'Voltar ao painel', ico: '🏠', fn: irPainel },
      { txt: 'Novo jogo', ico: '🔄', fn: () => confirmar('Começar um jogo novo? O placar será zerado.', () => { novoJogo(); irConfig('inicio'); }, 'Começar do zero') },
      { txt: 'Rever a revelação', ico: '🎬', fn: revelar },
      { txt: 'Comemorar de novo', ico: '🎉', cls: 'primario', tecla: 'Enter', fn: festa }
    ]);
  }

  /* ------------------------------------------------------------ início */
  irInicio();
})();
