/* Efeitos sonoros sintetizados (sem arquivos de áudio, funciona offline). */
window.Som = (function () {
  let ac = null;
  let mestre = null;
  let ligado = true;
  /* Volume de cada opção dos Ajustes (sem saturar: acima disso o som fica estridente). */
  const NIVEIS = { normal: 0.6, alto: 1, maximo: 1.6 };
  let nivel = 'alto';

  /* Cria o contexto de áudio mesmo com os efeitos desligados (a música de fundo usa o mesmo). */
  function garantir() {
    if (!ac) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ac = new C();
      /* Cadeia: volume → filtro que tira o chiado agudo → compressor leve
         (segura os picos) → limitador suave, que só age perto do máximo. */
      mestre = ac.createGain();
      mestre.gain.value = NIVEIS[nivel];
      const macio = ac.createBiquadFilter();
      macio.type = 'lowpass';
      macio.frequency.value = 5000;
      macio.Q.value = 0.5;
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 8;
      comp.ratio.value = 4;
      comp.attack.value = 0.003;
      comp.release.value = 0.15;
      const limitador = ac.createWaveShaper();
      const curva = new Float32Array(2048);
      for (let i = 0; i < curva.length; i++) {
        const x = (i / (curva.length - 1)) * 2 - 1;
        curva[i] = Math.abs(x) < 0.7 ? x : Math.sign(x) * (0.7 + 0.3 * Math.tanh((Math.abs(x) - 0.7) / 0.3));
      }
      limitador.curve = curva;
      limitador.oversample = '2x';
      mestre.connect(macio);
      macio.connect(comp);
      comp.connect(limitador);
      limitador.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function ctx() {
    if (!ligado) return null;
    return garantir();
  }
  /* Avisa a música de fundo para abaixar enquanto um efeito importante toca. */
  let aoEfeito = null;
  function efeito(seg) { if (ligado && aoEfeito) aoEfeito(seg); }

  function nota(freq, inicio, dur, opc) {
    const a = ctx(); if (!a) return;
    const o = Object.assign({ tipo: 'triangle', vol: 0.22, ate: null, destino: null }, opc || {});
    const dest = o.destino || mestre;
    const t0 = a.currentTime + inicio;
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = o.tipo;
    osc.frequency.setValueAtTime(freq, t0);
    if (o.ate) osc.frequency.exponentialRampToValueAtTime(o.ate, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(dest);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
    /* Notas suaves ganham uma camada um pouco mais brilhante (leve, para não ficar estridente). */
    if (o.tipo === 'triangle' || o.tipo === 'sine') {
      const b = a.createOscillator();
      const gb = a.createGain();
      b.type = 'square';
      b.frequency.setValueAtTime(freq, t0);
      if (o.ate) b.frequency.exponentialRampToValueAtTime(o.ate, t0 + dur);
      gb.gain.setValueAtTime(0.0001, t0);
      gb.gain.exponentialRampToValueAtTime(o.vol * 0.12, t0 + 0.015);
      gb.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      b.connect(gb); gb.connect(dest);
      b.start(t0); b.stop(t0 + dur + 0.05);
    }
  }

  let bufRuido = null;
  let ultTamanho = 0, ultMover = 0;
  function ruido(inicio, dur, opc) {
    const a = ctx(); if (!a) return;
    const o = Object.assign({ vol: 0.18, freq: 900, q: 0.8, ate: null, subida: 0.005, destino: null }, opc || {});
    if (!bufRuido) {
      bufRuido = a.createBuffer(1, a.sampleRate * 1, a.sampleRate);
      const d = bufRuido.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t0 = a.currentTime + inicio;
    const src = a.createBufferSource(); src.buffer = bufRuido;
    src.loop = true;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = o.q;
    f.frequency.setValueAtTime(o.freq, t0);
    if (o.ate) f.frequency.exponentialRampToValueAtTime(o.ate, t0 + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol, t0 + Math.min(o.subida, dur * 0.95));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(o.destino || mestre);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }

  return {
    get ligado() { return ligado; },
    set ligado(v) { ligado = !!v; },
    get nivel() { return nivel; },
    set nivel(v) {
      if (!NIVEIS[v]) return;
      nivel = v;
      if (mestre) mestre.gain.value = NIVEIS[v];
    },
    /* para a música de fundo (js/musica.js) */
    contexto: garantir,
    set aoEfeito(f) { aoEfeito = f; },

    clique() { nota(700, 0, 0.05, { tipo: 'square', vol: 0.06 }); },
    giro() { nota(1600, 0, 0.03, { tipo: 'square', vol: 0.09 }); },
    /* "Do Tamanho Certo": p vai de 0 (menor) a 1 (maior); o tom sobe com o tamanho */
    tamanho(p) {
      const agora = performance.now();
      if (agora - ultTamanho < 45) return;
      ultTamanho = agora;
      const f = 200 * Math.pow(2, Math.max(0, Math.min(1, p)) * 2.6);
      nota(f, 0, 0.08, { tipo: 'triangle', vol: 0.1, ate: f * 1.08 });
    },
    /* ... e um "tic" de madeira ao mover para os lados (p é a posição, 0 a 1) */
    mover(p) {
      const agora = performance.now();
      if (agora - ultMover < 70) return;
      ultMover = agora;
      ruido(0, 0.045, { vol: 0.12, freq: 700 + Math.max(0, Math.min(1, p)) * 1300, q: 4 });
      nota(330 + p * 330, 0, 0.04, { tipo: 'sine', vol: 0.06 });
    },
    tique() { nota(1100, 0, 0.05, { tipo: 'sine', vol: 0.14 }); },
    tiqueForte() { nota(880, 0, 0.1, { tipo: 'square', vol: 0.16 }); },

    revelar() {
      efeito(0.8);
      [523, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.06, 0.25, { vol: 0.14 }));
    },
    acerto() {
      efeito(1.6);
      [523, 659, 784].forEach((f, i) => nota(f, i * 0.08, 0.28, { vol: 0.2 }));
      nota(1047, 0.24, 0.7, { vol: 0.22 });
      nota(1319, 0.24, 0.7, { tipo: 'sine', vol: 0.1 });
    },
    meio() {
      efeito(1);
      nota(523, 0, 0.2, { vol: 0.18 });
      nota(659, 0.12, 0.4, { vol: 0.18 });
    },
    erro() {
      efeito(1);
      nota(220, 0, 0.5, { tipo: 'sawtooth', vol: 0.16, ate: 110 });
      nota(233, 0, 0.5, { tipo: 'sawtooth', vol: 0.11, ate: 116 });
    },
    tempo() {
      efeito(1.2);
      nota(150, 0, 0.9, { tipo: 'square', vol: 0.13 });
      nota(156, 0, 0.9, { tipo: 'sawtooth', vol: 0.09 });
    },
    passar() {
      nota(392, 0, 0.15, { vol: 0.16 });
      nota(523, 0.1, 0.25, { vol: 0.16 });
    },
    moeda() {
      nota(988, 0, 0.08, { tipo: 'square', vol: 0.06 });
      nota(1319, 0.07, 0.22, { tipo: 'square', vol: 0.06 });
    },
    suspense(seg) {
      const total = seg || 1.3;
      efeito(total + 0.8);
      let t = 0, passo = 0.055;
      while (t < total) {
        ruido(t, 0.05, { vol: 0.05 + 0.18 * (t / total), freq: 220, q: 0.6 });
        t += passo;
      }
      ruido(total, 0.35, { vol: 0.35, freq: 140, q: 0.5 });
      nota(98, total, 0.4, { tipo: 'sine', vol: 0.3 });
    },
    fanfarra() {
      efeito(3);
      const m = [[392, 0], [523, 0.15], [659, 0.3], [784, 0.45], [659, 0.7], [784, 0.85]];
      m.forEach(([f, t]) => { nota(f, t, 0.3, { tipo: 'square', vol: 0.07 }); nota(f, t, 0.3, { vol: 0.12 }); });
      [523, 659, 784, 1047].forEach(f => nota(f, 1.05, 1.4, { vol: 0.1 }));
      nota(1047, 1.05, 1.4, { tipo: 'square', vol: 0.05 });
    },

    /* Trilha do sorteio dos representantes e do tema da Aposta Final (cerca de 17 s). Os tempos
       batem com .sorteio-final em css/estilo.css e com os rolos em js/jogo.js. */
    sorteioFinal() {
      const a = ctx(); if (!a) return () => {};
      const grupo = a.createGain();
      grupo.connect(mestre);
      const d = { destino: grupo };
      const n = (f, t, dur, o) => nota(f, t, dur, Object.assign({}, d, o));
      const r = (t, dur, o) => ruido(t, dur, Object.assign({}, d, o));
      const tambor = (t, v) => { n(110, t, 0.6, { tipo: 'sine', vol: v, ate: 55 }); r(t, 0.2, { vol: 0.22, freq: 160, q: 0.7 }); };

      /* 0 s: estrondo e o selo; 1,5 e 1,7 s: os times entram */
      tambor(0.05, 0.6);
      r(0, 1.4, { vol: 0.08, freq: 300, ate: 1600, q: 1.2, subida: 1.2 });
      [1.5, 1.7].forEach((t, i) => { r(t - 0.22, 0.26, { vol: 0.1, freq: 500, ate: 2400, q: 1, subida: 0.22 }); tambor(t, 0.32); n(i ? 659 : 523, t, 0.3, { vol: 0.09 }); });
      /* 2,3 – 9 s: os rolos giram com rufo crescendo e um acorde grave que sobe */
      for (let t = 2.3; t < 9; t += 0.045) r(t, 0.05, { vol: 0.03 + 0.14 * Math.min(1, (t - 2.3) / 6.7), freq: 1800, q: 0.8 });
      n(98, 2.3, 6.7, { tipo: 'sawtooth', vol: 0.04, ate: 220 });
      n(147, 2.3, 6.7, { tipo: 'sawtooth', vol: 0.025, ate: 330 });
      /* 7 s: o primeiro rolo trava */
      tambor(7.0, 0.6);
      [392, 494, 587].forEach(f => n(f, 7.0, 0.5, { vol: 0.09 }));
      /* 7,3 – 8,9 s: o coração dispara enquanto o segundo rolo freia */
      let t = 7.3, iv = 0.5;
      while (t < 8.9) {
        n(55, t, 0.18, { tipo: 'sine', vol: 0.35, ate: 40 });
        n(52, t + 0.15, 0.15, { tipo: 'sine', vol: 0.25, ate: 38 });
        t += iv; iv = Math.max(0.3, iv * 0.88);
      }
      /* 9 s: o segundo rolo trava; 9,4 s: "Os representantes!" */
      tambor(9.0, 0.65);
      [523, 659, 784].forEach(f => n(f, 9.0, 0.6, { vol: 0.1 }));
      [[784, 9.4], [1047, 9.55]].forEach(([f, tt]) => { n(f, tt, 0.25, { tipo: 'square', vol: 0.05 }); n(f, tt, 0.3, { vol: 0.11 }); });
      /* 10,4 s: entra o painel do tema; 10,6 – 14,2 s: o rolo do tema gira */
      r(10.15, 0.3, { vol: 0.1, freq: 500, ate: 2400, q: 1, subida: 0.25 });
      tambor(10.45, 0.4);
      for (let tt = 10.6; tt < 14.2; tt += 0.045) r(tt, 0.05, { vol: 0.04 + 0.15 * ((tt - 10.6) / 3.6), freq: 1800, q: 0.8 });
      n(110, 10.6, 3.6, { tipo: 'sawtooth', vol: 0.04, ate: 247 });
      n(165, 10.6, 3.6, { tipo: 'sawtooth', vol: 0.025, ate: 370 });
      let tc = 12.6, ic = 0.42;
      while (tc < 14.05) { n(55, tc, 0.18, { tipo: 'sine', vol: 0.32, ate: 40 }); n(52, tc + 0.14, 0.15, { tipo: 'sine', vol: 0.22, ate: 38 }); tc += ic; ic = Math.max(0.28, ic * 0.88); }
      /* 14,2 s: o tema trava; 14,6 s: fanfarra */
      tambor(14.2, 0.7); tambor(14.35, 0.45);
      [262, 330, 392, 523].forEach(f => n(f, 14.2, 0.9, { vol: 0.1 }));
      r(14.2, 1.8, { vol: 0.12, freq: 6000, q: 0.5 });
      [[523, 14.6], [659, 14.75], [784, 14.9], [1047, 15.1]].forEach(([f, tt]) => { n(f, tt, 0.25, { tipo: 'square', vol: 0.05 }); n(f, tt, 0.25, { vol: 0.11 }); });
      tambor(15.35, 0.5);
      [523, 659, 784, 1047].forEach(f => n(f, 15.35, 1.9, { vol: 0.08 }));
      n(65.4, 15.35, 1.9, { tipo: 'sine', vol: 0.28 });
      r(15.35, 1.4, { vol: 0.08, freq: 6000, q: 0.5 });

      return () => {
        const agora = a.currentTime;
        grupo.gain.setValueAtTime(grupo.gain.value, agora);
        grupo.gain.linearRampToValueAtTime(0, agora + 0.25);
        setTimeout(() => grupo.disconnect(), 400);
      };
    },

    /* Fanfarra da revelação do campeão (quando não há o arquivo do hino). */
    fanfarraCampeao(empate) {
      efeito(4);
      const tambor = (t, v) => { nota(110, t, 0.6, { tipo: 'sine', vol: v, ate: 55 }); ruido(t, 0.2, { vol: 0.22, freq: 160, q: 0.7 }); };
      const m = empate
        ? [[523, 0.6, 0.18], [523, 0.8, 0.18], [659, 1.0, 0.18], [659, 1.2, 0.18], [784, 1.4, 0.4], [698, 1.8, 0.18]]
        : [[392, 0.6, 0.18], [523, 0.8, 0.18], [659, 1.0, 0.18], [784, 1.2, 0.45], [659, 1.65, 0.16], [784, 1.85, 0.16]];
      m.forEach(([f, t, dur]) => { nota(f, t, dur + 0.1, { tipo: 'square', vol: 0.06 }); nota(f, t, dur + 0.1, { vol: 0.12 }); });
      tambor(2.05, 0.5);
      [523, 659, 784, 1047].forEach(f => nota(f, 2.05, 2.4, { vol: 0.09 }));
      nota(1047, 2.05, 2.4, { tipo: 'square', vol: 0.04 });
      nota(65.4, 2.05, 2.4, { tipo: 'sine', vol: 0.3 });
      ruido(2.05, 1.6, { vol: 0.1, freq: 6000, q: 0.5 });
    },

    /* Trilha da cinemática do campeão (até a revelação, aos 13,4 s). Os tempos batem
       com as animações .cine de css/estilo.css. Devolve uma função que corta o som. */
    campeao(empate) {
      const a = ctx(); if (!a) return () => {};
      const grupo = a.createGain();
      grupo.connect(mestre);
      const d = { destino: grupo };
      const n = (f, t, dur, o) => nota(f, t, dur, Object.assign({}, d, o));
      const r = (t, dur, o) => ruido(t, dur, Object.assign({}, d, o));
      const tambor = (t, v) => { n(110, t, 0.6, { tipo: 'sine', vol: v || 0.45, ate: 55 }); r(t, 0.2, { vol: 0.22, freq: 160, q: 0.7 }); };

      /* 0 s: pancada grave e um vento que cresce */
      tambor(0.05, 0.5);
      r(0, 1.8, { vol: 0.09, freq: 400, ate: 1800, q: 1.2, subida: 1.5 });
      /* 2,0 e 2,25 s: os dois times entram */
      [2.0, 2.25].forEach((t, i) => {
        r(t - 0.25, 0.3, { vol: 0.1, freq: 500, ate: 2400, q: 1, subida: 0.25 });
        tambor(t, 0.35);
        n(i ? 659 : 523, t, 0.35, { vol: 0.1 });
      });
      /* 2,6 – 8,6 s: rufo de caixa crescendo enquanto os placares sobem */
      for (let t = 2.6; t < 8.6; t += 0.045) r(t, 0.05, { vol: 0.03 + 0.15 * ((t - 2.6) / 6), freq: 1800, q: 0.8 });
      /* 2,6 – 12,6 s: um acorde grave que sobe devagar (suspense) */
      n(98, 2.6, 10, { tipo: 'sawtooth', vol: 0.05, ate: 262 });
      n(147, 2.6, 10, { tipo: 'sawtooth', vol: 0.03, ate: 392 });
      /* 8,6 – 12,6 s: placares travados; o coração dispara (a luz pula entre os times) */
      r(8.6, 0.12, { vol: 0.18, freq: 6000, q: 0.6 });
      let t = 8.7, intervalo = 0.75;
      while (t < 12.4) {
        const v = 0.3 + 0.25 * ((t - 8.7) / 3.7);
        n(55, t, 0.18, { tipo: 'sine', vol: v, ate: 40 });
        n(52, t + 0.16, 0.16, { tipo: 'sine', vol: v * 0.7, ate: 38 });
        t += intervalo; intervalo = Math.max(0.32, intervalo * 0.9);
      }
      /* 12,6 s: corta tudo, só um prato abafado (quase um segundo de silêncio) */
      r(12.6, 0.12, { vol: 0.2, freq: 6000, q: 0.6 });
      /* 13,4 s: a revelação (a fanfarra ou o hino vêm em seguida, pelo jogo) */
      tambor(13.4, 0.65); tambor(13.55, 0.45);
      [262, 330, 392, 523].forEach(f => n(f, 13.4, 1.0, { vol: 0.1 }));
      n(65.4, 13.4, 2.5, { tipo: 'sine', vol: 0.3 });
      r(13.4, 2.2, { vol: 0.12, freq: 6000, q: 0.5 });

      return () => {
        const t = a.currentTime;
        grupo.gain.setValueAtTime(grupo.gain.value, t);
        grupo.gain.linearRampToValueAtTime(0, t + 0.25);
        setTimeout(() => grupo.disconnect(), 400);
      };
    },

    /* Trilha da vinheta de abertura (cerca de 13 s). Os tempos batem com as
       animações de css/estilo.css (.vinheta). Devolve uma função que corta o som
       (para quando pulam a vinheta). */
    vinheta() {
      const a = ctx(); if (!a) return () => {};
      const grupo = a.createGain();
      grupo.connect(mestre);
      const d = { destino: grupo };
      const n = (f, t, dur, o) => nota(f, t, dur, Object.assign({}, d, o));
      const r = (t, dur, o) => ruido(t, dur, Object.assign({}, d, o));
      const tambor = t => { n(120, t, 0.55, { tipo: 'sine', vol: 0.45, ate: 62 }); r(t, 0.18, { vol: 0.22, freq: 180, q: 0.7 }); };

      /* 0 – 2,4 s: a luz sobe (vento que cresce, nota grave e brilhos) */
      r(0, 2.4, { vol: 0.16, freq: 300, ate: 4200, q: 1.4, subida: 2.2 });
      n(65.4, 0, 2.6, { tipo: 'sine', vol: 0.28 });
      n(98, 0.4, 2.2, { tipo: 'sine', vol: 0.12 });
      [2093, 2637, 3136, 2349, 2794, 3520].forEach((f, i) => n(f, 0.3 + i * 0.32, 0.5, { tipo: 'sine', vol: 0.025 }));

      /* 2,4 – 3,9 s: as quatro peças do emblema caem (cruz, pomba, cálice, coroa) */
      [523, 659, 784, 1047].forEach((f, i) => {
        const t = 2.4 + i * 0.5;
        tambor(t);
        n(f, t, 0.7, { vol: 0.16 });
        n(f * 2, t, 0.5, { tipo: 'sine', vol: 0.04 });
      });

      /* 4,6 s: o título entra letra por letra */
      [523, 587, 659, 784, 880, 1047, 1175, 1319].forEach((f, i) => n(f, 4.6 + i * 0.08, 0.3, { vol: 0.09 }));
      n(1568, 5.3, 0.9, { tipo: 'sine', vol: 0.08 });

      /* 6,2 s: subtítulo */
      r(6.2, 0.45, { vol: 0.12, freq: 600, ate: 2400, q: 1, subida: 0.35 });
      [392, 523, 659].forEach(f => n(f, 6.55, 0.6, { vol: 0.09 }));

      /* 7,3 s e 8,3 s: os dois times entram, um de cada lado */
      [7.3, 8.3].forEach((t, i) => {
        r(t - 0.35, 0.45, { vol: 0.14, freq: 500, ate: 2600, q: 1, subida: 0.35 });
        tambor(t);
        n(i ? 659 : 523, t, 0.5, { tipo: 'square', vol: 0.06 });
        n(i ? 659 : 523, t, 0.5, { vol: 0.12 });
      });
      tambor(7.8);

      /* 9,4 s: fanfarra final */
      tambor(9.1); tambor(9.25);
      const m = [[392, 9.4, 0.2], [523, 9.6, 0.2], [659, 9.8, 0.2], [784, 10.0, 0.45], [659, 10.45, 0.18], [784, 10.65, 0.3]];
      m.forEach(([f, t, dur]) => { n(f, t, dur + 0.1, { tipo: 'square', vol: 0.07 }); n(f, t, dur + 0.1, { vol: 0.13 }); });
      tambor(10.95);
      [262, 523, 659, 784, 1047].forEach(f => n(f, 10.95, 2.2, { vol: 0.1 }));
      n(1047, 10.95, 2.2, { tipo: 'square', vol: 0.045 });
      n(65.4, 10.95, 2.2, { tipo: 'sine', vol: 0.3 });
      r(10.95, 1.6, { vol: 0.1, freq: 6000, q: 0.5 });

      return () => {
        const t = a.currentTime;
        grupo.gain.setValueAtTime(grupo.gain.value, t);
        grupo.gain.linearRampToValueAtTime(0, t + 0.25);
        setTimeout(() => grupo.disconnect(), 400);
      };
    }
  };
})();
