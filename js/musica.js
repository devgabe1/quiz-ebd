/* ==========================================================================
   Música de fundo, composta na hora (sem arquivos de áudio, funciona offline).

   Duas trilhas sonoras, escolhidas nos Ajustes:

   "SWING E ÉPICA" (a moderna): dois estilos que se alternam de uma canção
   para a outra (descritos logo abaixo).

   "DESENHO ANOS 30": jazz frenético de desenho animado antigo, no clima das
   músicas de chefão de fase, com som de disco de vinil (chiado, mono e a
   rotação que oscila um pouco). Cada canção sorteia um destes jeitos:
     - big band de chefão (a que sai mais), 224 a 256 batidas por minuto:
       bumbo em todos os tempos, viradas a cada 4 compassos, riffs quentes
       dos metais com os saxofones respondendo (e depois o contrário),
       notas gritadas com tremido e queda, trombone deslizando, corridas de
       xilofone, parte "da selva" nos tambores, solo de tambores, solo de
       xilofone, refrão final meio tom acima e um final com a banda subindo
       em escala cromática até o acorde gritado e um último ataque;
     - a mesma big band em tom menor, com clarinete;
     - dixieland rápido: trompete, clarinete fazendo floreios, trombone,
       tuba e banjo;
     - ragtime rápido: piano stride com tuba, banjo, bloco de madeira e o
       xilofone na melodia do "trio".
   As melodias são compostas na hora; nada é copiado de nenhuma trilha.

   Os estilos da trilha moderna:

   SWING (clima de desenho animado antigo, jazz dos anos 30):
     rápido e com swing; contrabaixo caminhando, piano "stride" de ragtime,
     clarinete, naipe de metais com ataques, bateria de jazz no prato de
     condução, solo de piano e um "shout chorus" com os metais no final.

   ÉPICO (eletrônico com guitarra pesada):
     tom menor; arpejo de sintetizador com eco, às vezes em compasso 7/8,
     subida com ruído e a caixa acelerando, "drop" com impacto grave,
     guitarras pesadas sincopadas com o bumbo e um solo de sintetizador.

   Nada é um trecho gravado que se repete: cada canção sorteia tom, andamento,
   acordes, frases, riffs e ritmos, e a melodia segue os acordes. Nas telas de
   pergunta a música fica calma (sem bateria, sem metais, sem guitarra e sem
   melodia), para o time conseguir pensar.
   ========================================================================== */
window.Musica = (function () {
  /* volume de cada opção dos Ajustes (bem abaixo dos efeitos do jogo) */
  const NIVEIS = { desligada: 0, baixa: 0.1, media: 0.2, alta: 0.36 };
  /* quanto a música fica em cada tela */
  const POR_TELA = { inicio: 1, config: 0.8, painel: 1, pergunta: 0.5, final: 0.5, fim: 0.85 };
  /* telas onde a música fica calma */
  const CALMAS = { pergunta: true, final: true };
  /* acerto fino do volume de cada estilo */
  const GANHO_ESTILO = { swing: 1.3, epico: 1, desenho: 1 };
  /* e depois do compressor (a trilha de desenho é mais cheia e soaria mais alta) */
  const SAIDA_ESTILO = { swing: 1, epico: 1, desenho: 0.6 };
  /* as trilhas que dá para escolher nos Ajustes */
  const TRILHAS = { moderna: 'Swing e épica', desenho: 'Desenho anos 30' };

  let ac = null, bus = null, seco = null, mix = null, verb = null, ruidoBuf = null;
  let guitE = null, guitD = null, eco = null, ecoPasso = 0;
  let caminhoModerno = null, caminhoAntigo = null, chiado = null, saidaEstilo = null;
  let nivel = 'media', fatorTela = 1, calmo = false, pausada = false, liberada = false;
  let rodando = false, timer = null, proximo = 0, pb = 0, desligarTimer = null, duckAte = 0;
  let estiloAnterior = null, tomAnterior = null, subAnterior = null;
  let trilha = 'moderna', trocarTrilha = false;

  const sortear = l => l[(Math.random() * l.length) | 0];
  const chance = q => Math.random() < q;
  const lim = (x, a, b) => Math.max(a, Math.min(b, x));
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  /* grau de uma nota no tom do momento (que muda quando a canção modula) */
  const grauDe = m => ((m - (B && B.tom != null ? B.tom : C.tom)) % 12 + 12) % 12;
  /* atraso da colcheia "de trás" no swing */
  const atrasoSw = (p, P) => p % 4 === 2 ? P * (C.sw != null ? C.sw : SWING) : 0;

  /* ------------------------------------------------------------ acordes */
  /* nome: [distância da tônica em semitons, intervalos do acorde] */
  const AC = {
    /* swing, tom maior */
    I6: [0, [0, 4, 7, 9]], I7: [0, [0, 4, 7, 10]], Idim: [1, [0, 3, 6, 9]], ii7: [2, [0, 3, 7, 10]], II7: [2, [0, 4, 7, 10]],
    iii7: [4, [0, 3, 7, 10]], III7: [4, [0, 4, 7, 10]], IV6: [5, [0, 4, 7, 9]], iv6: [5, [0, 3, 7, 9]], V7: [7, [0, 4, 7, 10]],
    vi7: [9, [0, 3, 7, 10]], VI7: [9, [0, 4, 7, 10]],
    /* swing, tom menor */
    i6: [0, [0, 3, 7, 9]], bVI7: [8, [0, 4, 7, 10]],
    /* ragtime: acorde aumentado */
    Iaug: [0, [0, 4, 8, 12]],
    /* épico (menor) */
    i: [0, [0, 3, 7, 14]], iv: [5, [0, 3, 7, 14]], v: [7, [0, 3, 7, 10]], V: [7, [0, 4, 7, 11]],
    III: [3, [0, 4, 7, 14]], VI: [8, [0, 4, 7, 14]], VII: [10, [0, 4, 7, 14]]
  };

  /* ------------------------------------------------------------ material do swing */
  const SW = {
    maior: {
      A: [['I6', 'VI7', 'ii7', 'V7', 'I6', 'I7', 'IV6', 'iv6'], ['I6', 'Idim', 'ii7', 'V7', 'iii7', 'VI7', 'ii7', 'V7'],
        ['I6', 'I6', 'II7', 'II7', 'ii7', 'V7', 'I6', 'V7'], ['I6', 'VI7', 'ii7', 'V7', 'III7', 'VI7', 'II7', 'V7']],
      B: [['III7', 'III7', 'VI7', 'VI7', 'II7', 'II7', 'V7', 'V7'], ['IV6', 'iv6', 'I6', 'VI7', 'II7', 'V7', 'I6', 'V7'],
        ['I7', 'I7', 'IV6', 'IV6', 'II7', 'II7', 'ii7', 'V7']],
      intro: ['I6', 'VI7', 'ii7', 'V7'], fim: ['ii7', 'V7', 'I6', 'I6']
    },
    menor: {
      A: [['i6', 'i6', 'V7', 'V7', 'V7', 'V7', 'i6', 'i6'], ['i6', 'iv6', 'i6', 'V7', 'i6', 'iv6', 'bVI7', 'V7'],
        ['i6', 'bVI7', 'V7', 'i6', 'iv6', 'i6', 'bVI7', 'V7']],
      B: [['iv6', 'iv6', 'i6', 'i6', 'bVI7', 'bVI7', 'V7', 'V7'], ['iv6', 'iv6', 'i6', 'i6', 'II7', 'bVI7', 'V7', 'V7']],
      intro: ['i6', 'bVI7', 'V7', 'V7'], fim: ['iv6', 'V7', 'i6', 'i6']
    }
  };
  /* frases de 2 compassos: [início, duração] em semicolcheias (32 no total) */
  const FRASES_SWING = [
    [[0, 2], [2, 2], [4, 4], [10, 2], [12, 6], [22, 2], [24, 8]],
    [[2, 2], [4, 2], [6, 4], [12, 4], [18, 2], [20, 2], [22, 6]],
    [[0, 6], [6, 2], [8, 2], [10, 6], [16, 2], [18, 2], [20, 2], [22, 10]],
    [[0, 2], [4, 2], [6, 2], [8, 8], [18, 2], [20, 2], [22, 2], [24, 8]],
    [[0, 4], [6, 2], [8, 4], [14, 2], [16, 4], [22, 2], [24, 8]]
  ];
  const FRASES_LONGAS = [[[0, 8], [8, 8], [16, 12], [28, 4]], [[0, 12], [12, 4], [16, 16]], [[2, 6], [8, 8], [16, 8], [24, 8]]];
  /* ataques dos metais na introdução */
  const ATAQUES = [[0, 6, 12], [0, 10], [0, 6, 14], [0, 4, 6]];

  /* ------------------------------------------------------------ material do épico */
  const EP = {
    prog: [['i', 'VI', 'III', 'VII'], ['i', 'VII', 'VI', 'VII'], ['VI', 'VII', 'i', 'i'], ['i', 'iv', 'VI', 'V'],
      ['i', 'i', 'VI', 'VII'], ['iv', 'VI', 'VII', 'i'], ['i', 'III', 'VII', 'iv']],
    quebra: [['VI', 'VI', 'iv', 'iv'], ['iv', 'v', 'VI', 'VII'], ['VI', 'III', 'VII', 'i']],
    build: [['VI', 'VII', 'VI', 'VII'], ['iv', 'iv', 'VII', 'VII'], ['VI', 'VI', 'VII', 'V']]
  };
  /* arpejos (índices: tônica, terça, quinta, oitava, nona, terça de cima) */
  const ARPEJOS = [[0, 2, 4, 2, 1, 3, 5, 3], [0, 1, 2, 3, 4, 3, 2, 1], [0, 2, 1, 3, 2, 4, 3, 5], [4, 2, 0, 2, 5, 3, 1, 3]];
  const GANCHOS = [
    [[0, 6], [6, 6], [12, 4], [16, 12]], [[0, 4], [4, 4], [8, 8], [16, 6], [22, 10]], [[2, 4], [6, 4], [10, 6], [16, 16]],
    [[0, 8], [8, 4], [12, 4], [16, 8], [24, 8]], [[0, 3], [3, 3], [6, 10], [16, 3], [19, 3], [22, 10]], [[0, 6], [6, 10], [16, 6], [22, 4], [26, 6]]
  ];
  const MENOR = [0, 2, 3, 5, 7, 8, 10];

  /* ------------------------------------------------------------ material do "desenho anos 30" */
  const DS = {
    bigband: { A: SW.maior.A, B: SW.maior.B, intro: ['I6', 'VI7', 'ii7', 'V7'], fim: ['ii7', 'V7', 'I6', 'I6'] },
    menor: {
      A: SW.menor.A.concat([['i6', 'i6', 'bVI7', 'V7', 'i6', 'i6', 'bVI7', 'V7']]), B: SW.menor.B,
      intro: ['i6', 'i6', 'i6', 'V7'], fim: ['iv6', 'V7', 'i6', 'i6']
    },
    ragtime: {
      A: [['I6', 'I6', 'V7', 'V7', 'V7', 'V7', 'I6', 'I6'], ['I6', 'Iaug', 'IV6', 'iv6', 'I6', 'VI7', 'II7', 'V7'],
        ['I6', 'I7', 'IV6', 'Idim', 'I6', 'VI7', 'II7', 'V7'], ['I6', 'III7', 'VI7', 'VI7', 'II7', 'II7', 'V7', 'V7']],
      B: [['V7', 'V7', 'I6', 'I6', 'II7', 'II7', 'V7', 'V7'], ['IV6', 'IV6', 'I6', 'I6', 'II7', 'II7', 'V7', 'V7'],
        ['vi7', 'vi7', 'III7', 'III7', 'vi7', 'II7', 'V7', 'V7']],
      trio: [['I6', 'I6', 'V7', 'V7', 'V7', 'V7', 'I6', 'I7'], ['I6', 'IV6', 'I6', 'VI7', 'II7', 'V7', 'I6', 'V7']],
      intro: [['V7', 'V7', 'V7', 'V7'], ['I6', 'VI7', 'II7', 'V7']], fim: ['I6', 'V7', 'I6', 'I6']
    },
    dixie: {
      A: [['I6', 'I6', 'I6', 'I7', 'IV6', 'iv6', 'I6', 'V7'], ['I6', 'VI7', 'II7', 'V7', 'I6', 'VI7', 'II7', 'V7'],
        ['I6', 'I6', 'II7', 'II7', 'V7', 'V7', 'I6', 'I6']],
      B: [['IV6', 'IV6', 'I6', 'I6', 'II7', 'II7', 'V7', 'V7'], ['III7', 'III7', 'VI7', 'VI7', 'II7', 'II7', 'V7', 'V7']],
      intro: ['I6', 'I6', 'V7', 'V7'], fim: ['II7', 'V7', 'I6', 'I6']
    }
  };
  /* riffs "quentes" de chefão (2 compassos): colcheias insistentes, notas repetidas e
     síncopes; a segunda metade do 2º compasso fica livre para os saxofones responderem */
  const FRASES_QUENTES = [
    [[0, 2], [2, 2], [4, 2], [6, 4], [10, 2], [12, 4], [16, 2], [18, 2], [20, 4]],
    [[0, 4], [4, 2], [6, 2], [8, 2], [10, 6], [16, 2], [18, 2], [20, 2], [22, 2]],
    [[2, 2], [4, 2], [6, 2], [8, 2], [10, 2], [12, 4], [18, 2], [20, 4]],
    [[0, 2], [2, 2], [4, 4], [8, 2], [10, 2], [12, 2], [14, 4], [18, 2], [20, 4]],
    [[0, 2], [2, 2], [4, 2], [6, 2], [8, 6], [14, 2], [16, 2], [18, 2], [20, 4]],
    [[0, 6], [6, 2], [8, 2], [10, 2], [12, 2], [14, 2], [16, 6], [22, 2]]
  ];
  /* resposta dos saxofones (4 colcheias no fim do 2º compasso), em passos na escada do acorde */
  const LICKS = [[1, 0, -1, -2], [-1, 0, 1, 3], [2, 1, 0, -1], [0, 0, 2, 1], [3, 2, 1, -1]];

  /* ragtime: ritmos sincopados da mão direita, em pares de compassos */
  const RAG_RITMOS = [
    [[0, 3, 6, 8, 10, 12, 14], [0, 2, 3, 6, 8]],
    [[0, 2, 3, 6, 8, 11, 14], [0, 3, 6, 8, 12]],
    [[2, 3, 6, 8, 10, 11, 14], [0, 2, 4, 6, 8]],
    [[0, 3, 6, 9, 12, 14], [0, 2, 3, 6, 8, 10]]
  ];
  function celulaRag() {
    const [r1, r2] = sortear(RAG_RITMOS);
    let i = sortear([3, 4, 5]);
    const anda = () => { const v = i; i = lim(i + sortear([-1, -1, 1, 1, 2, -2, 0]), 0, 7); return v; };
    return { r: [r1, r2], idx: [r1.map(anda), r2.map(anda)] };
  }

  /* guitarra pesada: 0 pausa, 1 abafada, 2 acento aberto */
  function novoRiff(passos) {
    const r = new Array(passos).fill(0);
    r[0] = 2;
    for (let i = 1; i < passos; i++) {
      const q = i % 4 === 0 ? 0.75 : i % 2 === 0 ? 0.5 : 0.3;
      if (chance(q)) r[i] = chance(0.15) ? 2 : 1;
    }
    for (let i = 3; i < passos; i++) if (r[i] && r[i - 1] && r[i - 2] && r[i - 3]) r[i] = 0;
    return r;
  }

  /* ------------------------------------------------------------ canção e compasso */
  let C = null;          /* a canção atual */
  let B = null;          /* o compasso atual */
  let vozes = [60, 64, 67];

  function novaCancao(t) {
    let tom;
    do { tom = 55 + ((Math.random() * 11) | 0); } while (tom === tomAnterior);
    tomAnterior = tom;
    let estilo;
    if (trilha === 'desenho') {
      estilo = 'desenho';
      cancaoDesenho(tom);
    } else {
      /* em geral alterna os estilos; às vezes repete */
      estilo = estiloAnterior !== 'swing' && estiloAnterior !== 'epico' ? sortear(['swing', 'epico']) :
        chance(0.8) ? (estiloAnterior === 'swing' ? 'epico' : 'swing') : estiloAnterior;
      if (estilo === 'swing') cancaoSwing(tom); else cancaoEpica(tom);
    }
    estiloAnterior = estilo;
    if (!mix) return;
    const tt = t || ac.currentTime;
    mix.gain.setValueAtTime(GANHO_ESTILO[estilo], tt);
    saidaEstilo.gain.setTargetAtTime(SAIDA_ESTILO[estilo], tt, 0.05);
    /* a trilha de desenho passa pelo "disco antigo"; a moderna, pelo caminho limpo */
    const antigo = estilo === 'desenho';
    caminhoModerno.gain.setTargetAtTime(antigo ? 0 : 1, tt, 0.04);
    caminhoAntigo.gain.setTargetAtTime(antigo ? 1 : 0, tt, 0.04);
    chiado.gain.setTargetAtTime(antigo ? 1 : 0, tt, 0.3);
  }

  function cancaoDesenho(tom) {
    let sub;
    /* a big band de chefão sai mais vezes; nunca o mesmo jeito duas vezes seguidas */
    do { sub = sortear(['bigband', 'bigband', 'bigband', 'menor', 'dixie', 'ragtime']); } while (sub === subAnterior);
    subAnterior = sub;
    const D = DS[sub];
    const A = sortear(D.A), Bp = sortear(D.B);
    let plano;
    if (sub === 'ragtime') {
      const trio = sortear(D.trio);
      plano = [['intro', 4, sortear(D.intro)], ['A', 8, A], ['A', 8, A], ['B', 8, Bp], ['A', 8, A],
        ['trio', 8, trio, 5], ['trio', 8, trio, 5], ['final', 4, D.fim, 5]];
    } else if (sub === 'dixie') {
      plano = [['intro', 4, D.intro], ['A', 8, A], ['A', 8, A], ['solo', 8, A], ['B', 8, Bp],
        ['break', 2, ['V7', 'V7']], ['shout', 8, A], ['final', 4, D.fim]];
    } else {
      plano = [['intro', 4, D.intro], ['A', 8, A], ['A', 8, A], ['B', 8, Bp], ['break', 2, ['V7', 'V7']],
        ['solo', 8, A], ['shout', 8, A], ['shout', 8, A, 1], ['final', 4, D.fim, 1]];
    }
    const frase = sortear(FRASES_SWING);
    let i0 = sortear([2, 3, 4]);
    const idx = frase.map(() => { const v = i0; i0 = lim(i0 + sortear([-2, -1, -1, 1, 1, 2, 0]), 0, 6); return v; });
    const longa = sortear(FRASES_LONGAS);
    let j0 = sortear([3, 4]);
    const idxL = longa.map(() => { const v = j0; j0 = lim(j0 + sortear([-1, 1, 2, -2]), 1, 6); return v; });
    const bpm = { bigband: [224, 256], menor: [212, 240], dixie: [204, 232], ragtime: [132, 152] }[sub];
    /* riff quente: notas repetidas e saltos curtos */
    const quente = sortear(FRASES_QUENTES);
    let q0 = sortear([3, 4, 5]);
    const idxQ = quente.map(() => { const v = q0; q0 = lim(q0 + sortear([0, 0, 1, -1, 1, -1, 2, -2]), 1, 7); return v; });
    C = {
      estilo: 'desenho', sub, modo: sub === 'menor' ? 'menor' : 'maior', tom,
      bpm: bpm[0] + Math.round(Math.random() * (bpm[1] - bpm[0])), passos: 16,
      sw: { bigband: 0.45, menor: 0.5, dixie: 0.55, ragtime: 0.06 }[sub],
      quente: { frase: quente, idx: idxQ, aprox: quente.map(() => chance(0.2)) }, lick: sortear(LICKS),
      plano: plano.map(([tipo, n, prog, transp]) => ({ tipo, n, prog, transp: transp || 0 })), sec: 0, comp: 0,
      riff: { frase, idx, aprox: frase.map(() => chance(0.3)) },
      longa: { frase: longa, idx: idxL },
      rag: { A: celulaRag(), B: celulaRag(), T: celulaRag() },
      ataques: sortear(ATAQUES), resp: sortear([[10, 12], [6, 12], [12, 14], [10, 14]]),
      melUlt: 74, solista: 74, obb: 79, obbDir: 1
    };
  }

  function cancaoSwing(tom) {
    const modo = chance(0.35) ? 'menor' : 'maior';
    const H = SW[modo];
    const A = sortear(H.A), Bp = sortear(H.B);
    const plano = [['intro', 4, H.intro], ['A', 8, A], ['A', 8, A], ['B', 8, Bp], ['A', 8, A], ['solo', 8, A], ['shout', 8, A]];
    if (chance(0.4)) plano.push(['shout', 8, A]);
    plano.push(['final', 4, H.fim]);
    const frase = sortear(FRASES_SWING);
    let i0 = sortear([2, 3, 4]);
    const idx = frase.map(() => { const v = i0; i0 = lim(i0 + sortear([-2, -1, -1, 1, 1, 2, 0]), 0, 6); return v; });
    const longa = sortear(FRASES_LONGAS);
    let j0 = sortear([3, 4]);
    const idxL = longa.map(() => { const v = j0; j0 = lim(j0 + sortear([-1, 1, 2, -2]), 1, 6); return v; });
    C = {
      estilo: 'swing', modo, tom, bpm: 160 + Math.round(Math.random() * 36), passos: 16,
      plano: plano.map(([tipo, n, prog]) => ({ tipo, n, prog })), sec: 0, comp: 0,
      riff: { frase, idx, aprox: frase.map(() => chance(0.3)) },
      longa: { frase: longa, idx: idxL },
      ataques: sortear(ATAQUES), melUlt: 74, solista: 74
    };
  }

  function cancaoEpica(tom) {
    const passos = chance(0.35) ? 14 : 16;
    const prog = sortear(EP.prog), quebra = sortear(EP.quebra), build = sortear(EP.build);
    const plano = [['intro', 4, prog], ['groove', 8, prog], ['build', 4, build], ['drop', 8, prog],
      ['quebra', 4, quebra], ['build', 4, build], ['drop', 8, prog], ['outro', 4, prog]];
    /* gancho do solo: 2 compassos, ajustado ao 7/8 quando for o caso */
    let ritmo = sortear(GANCHOS);
    if (passos !== 16) {
      const vistos = new Set();
      ritmo = ritmo.map(([s, d]) => [Math.floor(s / 16) * passos + Math.min(passos - 1, Math.round((s % 16) * passos / 16)), Math.max(2, Math.round(d * passos / 16))])
        .filter(([s]) => !vistos.has(s) && vistos.add(s));
    }
    const graus = [];
    let g = sortear([2, 4, 4, 7]);
    ritmo.forEach((_, i) => {
      graus.push(g);
      g = lim(g + (i === 0 ? sortear([1, 2, -1]) : sortear([-2, -1, -1, 1, 1, 2, 0])), 0, 7);
    });
    C = {
      estilo: 'epico', tom, bpm: 118 + Math.round(Math.random() * 24), passos,
      plano: plano.map(([tipo, n, p]) => ({ tipo, n, prog: p })), sec: 0, comp: 0,
      arp: sortear(ARPEJOS), riffA: novoRiff(passos), riffB: novoRiff(passos), meioTempo: chance(0.5),
      gancho: { ritmo, graus }, ultimaLider: null
    };
  }
  const passoDur = () => 60 / C.bpm / 4;

  function montarAcorde(nome, transp) {
    const [r, ints] = AC[nome];
    const base = C.tom + (transp || 0) + r;
    const centro = vozes.reduce((a, b) => a + b, 0) / vozes.length;
    vozes = ints.map(i => {
      let m = base + i;
      while (m < centro - 6) m += 12;
      while (m > centro + 6) m -= 12;
      return lim(m, 55, 77);
    }).sort((a, b) => a - b);
    let raiz = base - 24;
    while (raiz < 40) raiz += 12;
    while (raiz > 51) raiz -= 12;
    let raizAc = base - 24;
    while (raizAc < 36) raizAc += 12;
    while (raizAc > 47) raizAc -= 12;
    const pcs = ints.map(i => (base + i) % 12);
    const escada = [];
    for (let m = 52; m <= 90; m++) if (pcs.includes(m % 12)) escada.push(m);
    let alto = base;
    while (alto < 57) alto += 12;
    while (alto > 68) alto -= 12;
    const terca = ints[1];
    return { base, raiz, raizAc, ints, pcs, escada, arp: [alto, alto + terca, alto + 7, alto + 12, alto + 14, alto + 12 + terca], vozes: vozes.slice() };
  }

  function novoCompasso(t) {
    /* trocou a trilha nos Ajustes: começa logo uma canção da trilha nova */
    if (!C || trocarTrilha) { trocarTrilha = false; novaCancao(t); }
    if (C.comp >= C.plano[C.sec].n) {
      C.sec++; C.comp = 0;
      if (C.sec >= C.plano.length) novaCancao(t);
    }
    const s = C.plano[C.sec];
    const nome = s.prog[C.comp % s.prog.length];
    const ultimo = C.comp === s.n - 1;
    const prox = ultimo ? C.plano[C.sec + 1] : s;
    const nomeProx = prox ? prox.prog[ultimo ? 0 : (C.comp + 1) % s.prog.length] : nome;
    B = {
      tipo: s.tipo, comp: C.comp, n: s.n, passos: C.passos, acorde: montarAcorde(nome, s.transp),
      tom: C.tom + (s.transp || 0),
      proxBase: C.tom + ((prox && prox.transp) || 0) + AC[nomeProx][0], inicio: C.comp === 0, ultimo,
      proxTipo: ultimo && prox ? prox.tipo : null, walk: null
    };
    C.comp++;
  }

  /* ------------------------------------------------------------ mesa de som */
  function env(g, t, ataque, dur, soltura, pico) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(pico, t + ataque);
    g.gain.setValueAtTime(pico, t + Math.max(ataque, dur - soltura));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  /* seco, com sala (reverberação) e posição no estéreo (-1 esquerda, 1 direita) */
  function saidaPara(no, molhado, pan) {
    let x = no;
    if (pan) { const p = ac.createStereoPanner(); p.pan.value = pan; no.connect(p); x = p; }
    x.connect(seco);
    if (molhado) { const s = ac.createGain(); s.gain.value = molhado; x.connect(s); s.connect(verb); }
  }
  function osc(tipo, m, t, fim, detune) {
    const o = ac.createOscillator(); o.type = tipo; o.frequency.value = hz(m);
    if (detune) o.detune.value = detune;
    o.start(t); o.stop(fim);
    return o;
  }
  function vibrato(alvos, t, d, prof, vel) {
    const v = ac.createOscillator(); v.frequency.value = vel || 5.5;
    const g = ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.setValueAtTime(0, t + Math.min(0.2, d * 0.4));
    g.gain.linearRampToValueAtTime(d > 0.35 ? prof : 0, t + Math.min(0.55, d));
    v.connect(g); alvos.forEach(o => g.connect(o.detune));
    v.start(t); v.stop(t + d + 0.2);
  }

  /* ------------------------------------------------------------ instrumentos do swing */
  /* piano de bar antigo: duas cordas um pouco desafinadas entre si */
  function piano(m, t, dur, vol, pan) {
    const d = Math.max(0.15, dur), fim = t + Math.max(0.3, d) + 0.3;
    const f = ac.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(4200, t); f.frequency.exponentialRampToValueAtTime(1500, t + 0.35);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.003);
    g.gain.exponentialRampToValueAtTime(vol * 0.35, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.3, d) + 0.25);
    [[-8, 1], [8, 1]].forEach(([c]) => osc('triangle', m, t, fim, c).connect(f));
    const h2 = ac.createGain(); h2.gain.value = 0.3; osc('sine', m + 12, t, fim).connect(h2); h2.connect(f);
    f.connect(g); saidaPara(g, 0.3, pan || 0);
  }
  function acordePiano(a, t, vol, dur) { a.vozes.forEach((m, i) => piano(m, t + i * 0.004, dur, vol, 0.1)); }
  /* contrabaixo acústico (pizzicato) */
  function baixoAc(m, t, dur, vol) {
    const d = Math.max(0.2, dur), fim = t + d + 0.1;
    const f = ac.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(950, t); f.frequency.exponentialRampToValueAtTime(320, t + 0.12);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(vol * 0.45, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.06);
    osc('triangle', m, t, fim).connect(f);
    const s = ac.createGain(); s.gain.value = 0.8; osc('sine', m, t, fim).connect(s); s.connect(f);
    f.connect(g); saidaPara(g, 0.05);
    ruido(t, 0.03, vol * 0.25, 'lowpass', 700, 0.7, 0.001, 0);
  }
  /* trompete (com surdina fica mais escuro e abafado).
     fx.tremido: o "shake" (vibrato largo e rápido das notas gritadas);
     fx.queda: a nota cai no fim (o "fall-off" das big bands) */
  function metal(m, t, dur, vol, surdina, pan, fx) {
    const d = Math.max(0.09, dur), fim = t + d + 0.15;
    const pico = surdina ? 1300 : 3300;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(450, t);
    f.frequency.exponentialRampToValueAtTime(pico, t + 0.04);
    f.frequency.exponentialRampToValueAtTime(pico * 0.6, t + 0.04 + Math.min(0.3, d));
    const g = ac.createGain(); env(g, t, 0.02, d + 0.06, Math.min(0.08, d * 0.4), vol);
    const o1 = osc('sawtooth', m, t, fim), o2 = osc('sawtooth', m, t, fim, 6);
    /* o trompetista "chega" na nota por baixo */
    o1.detune.setValueAtTime(-35, t); o1.detune.linearRampToValueAtTime(0, t + 0.05);
    if (fx && fx.queda && d > 0.2) [o1, o2].forEach((o, i) => {
      const base = i ? 6 : 0;
      o.detune.setValueAtTime(base, t + d * 0.7);
      o.detune.linearRampToValueAtTime(base - 800, t + d + 0.05);
    });
    const g2 = ac.createGain(); g2.gain.value = 0.5;
    o1.connect(f); o2.connect(g2); g2.connect(f);
    if (fx && fx.tremido) vibrato([o1, o2], t, d * (fx.queda ? 0.7 : 1), 70, 7.5);
    else vibrato([o1, o2], t, d, 14, 5.6);
    f.connect(g); saidaPara(g, 0.25, pan || 0);
  }
  /* nota gritada dos trompetes: o naipe e um trompete uma oitava acima, com tremido e queda */
  function grito(a, m, t, d, vol) {
    naipe(a, m, t, d, vol);
    metal(m + 12 <= 89 ? m + 12 : m, t, d, vol * 0.8, false, 0.15, { tremido: true, queda: true });
  }
  function acordeMetal(a, t, dur, vol, surdina) {
    a.vozes.forEach((m, i) => metal(m + (m < 62 ? 12 : 0), t, dur, vol, surdina, [-0.3, -0.1, 0.1, 0.3][i % 4]));
  }
  /* naipe: a melodia no trompete, duas notas do acorde abaixo e o trombone uma oitava abaixo */
  function naipe(a, m, t, dur, vol) {
    metal(m, t, dur, vol, false, 0.1);
    const abaixo = a.escada.filter(x => x < m - 2 && x >= m - 12).reverse();
    if (abaixo[0]) metal(abaixo[0], t, dur, vol * 0.6, false, -0.25);
    if (abaixo[1]) metal(abaixo[1], t, dur, vol * 0.5, false, 0.3);
    metal(m - 12, t, dur, vol * 0.45, true, -0.1);
  }
  /* clarinete: onda quadrada (só harmônicos ímpares) com vibrato */
  function clarinete(m, t, dur, vol) {
    const d = Math.max(0.09, dur), fim = t + d + 0.12;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400; f.Q.value = 0.5;
    const g = ac.createGain(); env(g, t, 0.025, d + 0.05, 0.06, vol);
    const o = osc('square', m, t, fim);
    vibrato([o], t, d, 12, 5.2);
    o.connect(f); f.connect(g); saidaPara(g, 0.3, -0.15);
  }

  /* ------------------------------------------------------------ instrumentos do épico */
  function pad(m, t, dur, vol, pan, corte) {
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = corte || 1100; f.Q.value = 0.4;
    const g = ac.createGain();
    env(g, t, 0.35, dur, 0.7, vol);
    [-14, 0, 14].forEach(c => osc('sawtooth', m, t, t + dur + 0.1, c).connect(f));
    f.connect(g); saidaPara(g, 0.5, pan);
  }
  function acordeTeclado(a, t, dur, vol, corte) {
    const pans = [-0.45, -0.15, 0.15, 0.45];
    a.vozes.forEach((m, i) => pad(m, t, dur, vol, pans[i % 4], corte));
  }
  /* baixo sintetizado: corpo grave + "dedada" com filtro que fecha */
  function baixoSub(m, t, dur, vol) {
    const fim = t + dur + 0.05;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 1.5;
    f.frequency.setValueAtTime(1100, t); f.frequency.exponentialRampToValueAtTime(380, t + 0.14);
    const g = ac.createGain(); env(g, t, 0.006, dur, Math.min(0.08, dur * 0.4), vol);
    osc('sine', m, t, fim).connect(f);
    const g2 = ac.createGain(); g2.gain.value = 0.5; osc('sawtooth', m, t, fim).connect(g2); g2.connect(f);
    f.connect(g); saidaPara(g, 0);
  }
  /* sintetizador do arpejo: filtro ressonante que abre e fecha, com eco */
  function sint(m, t, dur, vol, corte, pan) {
    const fim = t + dur + 0.05;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 5;
    f.frequency.setValueAtTime(corte * 2.2, t); f.frequency.exponentialRampToValueAtTime(corte, t + 0.08);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc('sawtooth', m, t, fim).connect(f);
    const q = ac.createGain(); q.gain.value = 0.5; osc('square', m, t, fim, 7).connect(q); q.connect(f);
    f.connect(g); saidaPara(g, 0.15, pan);
    const s = ac.createGain(); s.gain.value = 0.35; g.connect(s); s.connect(eco);
  }
  /* sintetizador solo, com deslize entre as notas */
  function lider(m, t, dur, vol, deM) {
    const d = Math.max(0.15, Math.min(dur * 0.95, 2.4)), fim = t + d + 0.15;
    const os = [osc('sawtooth', m, t, fim, -6), osc('sawtooth', m, t, fim, 6)];
    const sub = osc('square', m - 12, t, fim);
    if (deM != null) [...os, sub].forEach((o, i) => {
      const alvo = hz(i < 2 ? m : m - 12), de = hz(i < 2 ? deM : deM - 12);
      o.frequency.setValueAtTime(de, t); o.frequency.linearRampToValueAtTime(alvo, t + 0.07);
    });
    vibrato(os, t, d, 15, 5.8);
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2800; f.Q.value = 1;
    const g = ac.createGain(); env(g, t, 0.015, d + 0.08, 0.1, vol);
    os.forEach(o => o.connect(f));
    const sg = ac.createGain(); sg.gain.value = 0.3; sub.connect(sg); sg.connect(f);
    f.connect(g); saidaPara(g, 0.3, -0.1);
    const s = ac.createGain(); s.gain.value = 0.4; g.connect(s); s.connect(eco);
  }
  /* guitarra pesada: power chord gravado duas vezes, uma em cada lado */
  function guitarra(raiz, t, dur, vol, abafada) {
    const fim = abafada ? 0.12 : Math.max(dur, 0.3);
    [[guitE, -7, 0], [guitD, 7, 0.011]].forEach(([dest, cents, atraso]) => {
      [raiz, raiz + 7, raiz + 12].forEach((m, i) => {
        const tt = t + atraso + i * 0.005;
        const o = osc('sawtooth', m, tt, tt + fim + 0.05, cents + (Math.random() - 0.5) * 4);
        const g = ac.createGain();
        g.gain.setValueAtTime(0.0001, tt);
        g.gain.exponentialRampToValueAtTime(vol, tt + 0.004);
        if (!abafada) {
          g.gain.exponentialRampToValueAtTime(vol * 0.5, tt + 0.22);
          g.gain.setValueAtTime(vol * 0.5, tt + Math.max(0.23, fim - 0.07));
        }
        g.gain.exponentialRampToValueAtTime(0.0001, tt + fim);
        if (abafada) {
          const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
          o.connect(f); f.connect(g);
        } else o.connect(g);
        g.connect(dest);
      });
    });
  }
  /* subida de ruído antes do drop */
  function subida(t, dur, vol) {
    const s = ac.createBufferSource(); s.buffer = ruidoBuf; s.loop = true;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2;
    f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(7000, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.06);
    s.connect(f); f.connect(g); saidaPara(g, 0.3);
    s.start(t); s.stop(t + dur + 0.1);
  }
  /* impacto grave no começo do drop */
  function impacto(t, vol) {
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(32, t + 0.9);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    o.connect(g); saidaPara(g, 0.3);
    o.start(t); o.stop(t + 1.45);
    ruido(t, 1.2, vol * 0.35, 'lowpass', 500, 0.7, 0.002, 0.4);
  }

  /* ------------------------------------------------------------ bateria (ruído filtrado) */
  function ruido(t, dur, vol, tipoF, freq, q, ataque, molhado, pan) {
    const s = ac.createBufferSource(); s.buffer = ruidoBuf; s.loop = true;
    const f = ac.createBiquadFilter(); f.type = tipoF; f.frequency.value = freq; f.Q.value = q || 0.7;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (ataque || 0.002));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); saidaPara(g, molhado != null ? molhado : 0.08, pan);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02);
  }
  function bumbo(t, vol) {
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.11);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol * 0.5, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    o.connect(g); g.connect(seco);
    o.start(t); o.stop(t + 0.37);
    ruido(t, 0.018, vol * 0.18, 'bandpass', 3200, 0.8, 0.001, 0);
  }
  function caixa(t, vol) {
    const o = ac.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(230, t); o.frequency.exponentialRampToValueAtTime(160, t + 0.07);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol * 0.5, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    o.connect(g); saidaPara(g, 0.3);
    o.start(t); o.stop(t + 0.16);
    ruido(t, 0.2, vol, 'highpass', 1700, 0.6, 0.001, 0.35);
    ruido(t, 0.07, vol * 0.5, 'bandpass', 3800, 1, 0.001, 0);
  }
  function tom(t, freq, vol, pan) {
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(freq * 1.25, t); o.frequency.exponentialRampToValueAtTime(freq, t + 0.06);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    o.connect(g); saidaPara(g, 0.25, pan);
    o.start(t); o.stop(t + 0.42);
    ruido(t, 0.03, vol * 0.25, 'lowpass', 1800, 0.7, 0.001, 0, pan);
  }
  function chimbal(t, vol, aberto) { ruido(t, aberto ? 0.2 : 0.035, vol, 'highpass', 7500, 0.5, 0.002, 0.05, 0.3); }
  function prato(t, vol) { ruido(t, 2, vol, 'highpass', 4500, 0.4, 0.002, 0.25, -0.3); }
  /* prato de condução (o "ding" do jazz) */
  function conducao(t, vol) {
    ruido(t, 0.45, vol, 'bandpass', 6000, 1.6, 0.001, 0.12, 0.35);
    ruido(t, 0.05, vol * 0.7, 'highpass', 9000, 0.5, 0.001, 0, 0.35);
  }

  /* ------------------------------------------------------------ SWING: um passo */
  const SWING = 0.62;   /* atraso da colcheia "de trás" (em semicolcheias) */

  function linhaWalking(a, proxBase) {
    const r = a.raizAc;
    let alvo = proxBase - 24;
    while (alvo < r - 6) alvo += 12;
    while (alvo > r + 6) alvo -= 12;
    const n2 = r + sortear([a.ints[1], 2, a.ints[1]]);
    const n3 = r + sortear([7, 7, a.ints[3]]);
    return [r, n2, n3, alvo + sortear([-1, 1, -1])];
  }

  function passoSwing(p, t, P) {
    const T = B.tipo, a = B.acorde, c = B.comp;
    const ts = t + (p % 4 === 2 ? P * SWING : 0);
    const h = () => (Math.random() - 0.5) * 0.008;

    if (calmo) {
      if (p === 0) acordePiano(a, t, 0.03, 1.6);
      if (p === 0 || p === 8) baixoAc(p === 0 ? a.raizAc : a.raizAc + 7, t, 8 * P * 0.9, 0.14);
      if (p === 10 && chance(0.35)) piano(sortear(a.escada.filter(m => m >= 67 && m <= 79)), ts, 0.8, 0.02, 0.2);
      return;
    }

    /* final: dois compassos de ataques, um rufo e o acorde grande */
    if (T === 'final') {
      if (c < 2 && (p === 0 || p === 6)) {
        const tt = p === 6 ? ts : t;
        acordeMetal(a, tt, 0.22, 0.04); acordePiano(a, tt, 0.035, 0.3); baixoAc(a.raizAc, tt, 0.3, 0.2);
        caixa(tt, 0.2); bumbo(tt, 0.6);
      }
      if (c === 1 && p >= 8) caixa(t, 0.06 + (p - 8) * 0.03);
      if (c === 2 && p === 0) {
        const d = 16 * P * 1.8;
        acordeMetal(a, t, d, 0.035);
        const topo = a.escada.find(m => m >= 76 && m % 12 === a.base % 12);
        if (topo) metal(topo, t, d, 0.045, false, 0);
        acordePiano(a, t, 0.045, 2.5); baixoAc(a.raizAc, t, 2.5, 0.22); bumbo(t, 0.9); prato(t, 0.15);
      }
      return;
    }

    /* introdução: ataques dos metais com a bateria, depois a banda entra */
    if (T === 'intro' && c < 2) {
      if (C.ataques.includes(p)) {
        acordeMetal(a, ts, 0.2, 0.04); bumbo(ts, 0.6); caixa(ts, 0.2); baixoAc(a.raizAc, ts, 0.25, 0.2);
        if (p === 0) prato(t, 0.1);
      }
      if (c === 1 && p >= 12) caixa(ts, 0.1 + (p - 12) * 0.04);
      return;
    }

    /* bateria */
    const forte = T === 'shout';
    if (B.ultimo && p >= 8) {
      if (p % 2 === 0) {
        const k = (p - 8) / 2;
        if (k < 2) caixa(ts + h(), 0.12 + k * 0.06);
        else tom(ts, k === 2 ? 180 : 120, 0.24, k === 2 ? 0.3 : -0.3);
      }
      if (p === 8) bumbo(t, 0.5);
    } else {
      if (p % 4 === 0) conducao(t + h(), forte ? 0.11 : 0.08);
      if (p === 6 || p === 14) conducao(ts + h(), forte ? 0.07 : 0.05);
      if (p === 4 || p === 12) chimbal(t, 0.06, false);
      if (p % 4 === 0) bumbo(t, forte ? (p % 8 === 0 ? 0.5 : 0.3) : 0.2);
      if (forte && (p === 4 || p === 12)) caixa(t + h(), 0.2);
      else if (p % 4 === 2 && chance(0.18)) caixa(ts + h(), 0.06);
      if (forte && p === 14 && c % 4 === 3) { bumbo(ts, 0.7); prato(ts, 0.1); }
    }
    if (p === 0 && ((B.inicio && (T === 'shout' || T === 'B' || T === 'A')) || (T === 'intro' && c === 2))) prato(t, 0.09);

    /* contrabaixo: "a dois" no começo, depois caminhando */
    const doisTempos = T === 'intro' || (T === 'A' && C.sec === 1);
    if (!B.walk) B.walk = linhaWalking(a, B.proxBase);
    if (p % 4 === 0) {
      const k = p / 4;
      if (!doisTempos) baixoAc(B.walk[k], t, 4 * P * 0.95, 0.2);
      else if (k === 0 || k === 2) baixoAc(k === 0 ? B.walk[0] : a.raizAc + 7, t, 8 * P * 0.9, 0.21);
    }

    /* piano: stride (grave nos tempos 1 e 3, acorde nos 2 e 4) ou comping */
    if (T === 'A' || T === 'B' || T === 'intro') {
      if (p === 0) { piano(a.raizAc + 12, t, 0.35, 0.045, -0.1); piano(a.raizAc, t, 0.35, 0.03, -0.1); }
      if (p === 8) piano(a.raizAc + 12 + (chance(0.5) ? 7 : 0), t, 0.35, 0.04, -0.1);
      if (p === 4 || p === 12) acordePiano(a, t + h(), 0.03, 0.22);
    } else if (p === 0 || p === 6) {
      acordePiano(a, p === 6 ? ts : t, T === 'shout' ? 0.02 : 0.026, 0.25);
    }

    /* melodia */
    if (T === 'A') {
      /* na terceira vez o trompete pega a melodia; na segunda, os metais fazem um fundo com surdina */
      const instr = C.sec === 4 ? (m, tt, d, g) => metal(m, tt, d, g ? 0.025 : 0.05, false, 0.1)
        : (m, tt, d, g) => clarinete(m, tt, d, g ? 0.03 : 0.055);
      frase(p, t, P, instr);
      if (C.sec === 2 && p === 0 && c % 2 === 0) acordeMetal(a, t, 32 * P * 0.9, 0.012, true);
    } else if (T === 'B') {
      fraseLonga(p, t, P);
    } else if (T === 'solo') {
      improviso(p, t, P);
    } else if (T === 'shout') {
      frase(p, t, P, (m, tt, d, g) => g ? metal(m, tt, d, 0.025) : naipe(a, m, tt, d, 0.045));
    }
  }

  /* a frase principal: 3 vezes o riff de 2 compassos e um fechamento */
  function frase(p, t, P, tocar, outra) {
    const c8 = B.comp % 8;
    if (c8 === 7) return;
    const F = outra || C.riff, a = B.acorde;
    let pos = (B.comp % 2) * 16 + p;
    if (c8 === 6) {
      if (p === 8) {
        const raizes = a.escada.filter(m => m >= 64 && m <= 82 && m % 12 === a.base % 12);
        const m = raizes.reduce((x, y) => Math.abs(y - C.melUlt) < Math.abs(x - C.melUlt) ? y : x, raizes[0]);
        tocar(m, t, 24 * P * 0.95);
        C.melUlt = m;
        return;
      }
      if (p > 8) return;
      pos = p;
    }
    const k = F.frase.findIndex(([s]) => s === pos);
    if (k < 0) return;
    const [s, dur] = F.frase[k];
    const i = F.idx[k] + (c8 >= 2 && c8 < 4 && k === F.frase.length - 1 ? 1 : 0);
    const esc = a.escada.filter(m => m >= 60 && m <= 86);
    const centro = Math.max(0, esc.findIndex(m => m >= 70));
    const m = esc[lim(centro + i - 3, 0, esc.length - 1)];
    const ts = t + atrasoSw(p, P);
    if (F.aprox[k] && k > 0) tocar(m - 1, ts - 0.04, 0.05, true);
    tocar(m, ts, (c8 === 6 ? Math.min(dur, 8 - s) : dur) * P * 0.92);
    C.melUlt = m;
  }
  /* parte B: notas longas (trompete com surdina, ou o instrumento pedido) */
  function fraseLonga(p, t, P, tocar) {
    const pos = (B.comp % 2) * 16 + p;
    const F = C.longa, k = F.frase.findIndex(([s]) => s === pos);
    if (k < 0) return;
    const esc = B.acorde.escada.filter(m => m >= 60 && m <= 82);
    const centro = Math.max(0, esc.findIndex(m => m >= 67));
    const m = esc[lim(centro + F.idx[k] - 3, 0, esc.length - 1)];
    (tocar || ((mm, tt, d) => metal(mm, tt, d, 0.05, true, 0.15)))(m, t + atrasoSw(p, P), F.frase[k][1] * P * 0.95);
  }
  /* solo improvisado em colcheias com swing (piano, ou o instrumento pedido) */
  function improviso(p, t, P, tocar) {
    if (p % 2) return;
    const c4 = B.comp % 4;
    if (c4 === 3 && p > 4) return;
    if (!chance(c4 === 3 ? 0.5 : 0.7)) return;
    const ESC = C.modo === 'menor' ? [0, 2, 3, 5, 7, 8, 11] : [0, 2, 4, 5, 7, 9, 11];
    const notas = [];
    for (let m = 64; m <= 86; m++) if (ESC.includes(grauDe(m))) notas.push(m);
    let i = notas.findIndex(m => m >= C.solista);
    if (i < 0) i = notas.length - 1;
    i = lim(i + sortear([-2, -1, -1, 1, 1, 2]), 0, notas.length - 1);
    let m = notas[i];
    if (p % 4 === 0 && !B.acorde.pcs.includes(m % 12)) {
      const v = [m - 1, m + 1, m - 2, m + 2].find(x => B.acorde.pcs.includes(x % 12));
      if (v) m = v;
    }
    C.solista = m;
    const ts = t + atrasoSw(p, P);
    if (tocar) { tocar(m, ts, P * 1.8); return; }
    /* a "nota de blues": escorrega meio tom para a terça */
    if (C.modo === 'maior' && grauDe(m) === 4 && chance(0.35)) piano(m - 1, ts - 0.03, 0.05, 0.03, 0.2);
    piano(m, ts, P * 1.8, 0.045, 0.2);
  }

  /* ------------------------------------------------------------ instrumentos do "desenho anos 30" */
  /* xilofone: barra de madeira (fundamental + o 3º harmônico que some rápido) e a batida da baqueta */
  function xilofone(m, t, vol, pan) {
    const fim = t + 0.35;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    osc('sine', m, t, fim).connect(g);
    const g3 = ac.createGain();
    g3.gain.setValueAtTime(0.5, t); g3.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc('sine', m + 19, t, fim).connect(g3); g3.connect(g);
    saidaPara(g, 0.2, pan != null ? pan : 0.25);
    ruido(t, 0.015, vol * 0.4, 'bandpass', 2500, 1.5, 0.001, 0, pan != null ? pan : 0.25);
  }
  /* nota longa no xilofone vira um "rufo" (a nota batida várias vezes) */
  function xiloNota(m, t, d, vol) {
    xilofone(m, t, vol);
    if (d > 0.3) for (let x = 0.07; x < d - 0.04; x += 0.07) xilofone(m, t + x, vol * 0.55);
  }
  /* corrida rápida de xilofone (escala, arpejo ou cromática), 8 semicolcheias */
  function corrida(a, t, P, vol) {
    const tipo = sortear(['escala', 'arpejo', 'cromatica']);
    let notas = [];
    if (tipo === 'arpejo') notas = a.escada.filter(m => m >= 67 && m <= 93).slice(0, 8);
    else if (tipo === 'escala') {
      const ESC = C.modo === 'menor' ? [0, 2, 3, 5, 7, 8, 11] : [0, 2, 4, 5, 7, 9, 11];
      for (let m = 72; notas.length < 8 && m < 96; m++) if (ESC.includes(grauDe(m))) notas.push(m);
    } else {
      const topo = a.escada.find(m => m >= 81) || 84;
      for (let i = 0; i < 8; i++) notas.push(topo - i);
    }
    if (tipo !== 'cromatica' && chance(0.4)) notas.reverse();
    notas.forEach((m, i) => xilofone(m, t + i * P, vol));
  }
  /* saxofone dos anos 30: vibrato largo */
  function sax(m, t, dur, vol, pan) {
    const d = Math.max(0.09, dur), fim = t + d + 0.12;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 2;
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(2600, t + 0.05);
    f.frequency.exponentialRampToValueAtTime(1800, t + Math.max(0.06, d));
    const g = ac.createGain(); env(g, t, 0.02, d + 0.05, Math.min(0.06, d * 0.4), vol);
    const o = osc('sawtooth', m, t, fim), q = osc('square', m, t, fim, 4);
    const gq = ac.createGain(); gq.gain.value = 0.6;
    o.connect(f); q.connect(gq); gq.connect(f);
    vibrato([o, q], t, d, 22, 5.8);
    f.connect(g); saidaPara(g, 0.25, pan || 0);
  }
  /* naipe de saxofones: a melodia, duas notas do acorde abaixo e o barítono */
  function naipeSax(a, m, t, dur, vol) {
    sax(m, t, dur, vol, -0.2);
    const abaixo = a.escada.filter(x => x < m - 2 && x >= m - 13).reverse();
    if (abaixo[0]) sax(abaixo[0], t, dur, vol * 0.65, 0.1);
    if (abaixo[1]) sax(abaixo[1], t, dur, vol * 0.55, -0.35);
    const bari = a.escada.find(x => x >= 52 && x <= 60);
    if (bari) sax(bari - 12, t, dur, vol * 0.5, 0.3);
  }
  function fundoSax(a, t, dur, vol) { a.vozes.forEach((m, i) => sax(m, t, dur, vol, [-0.3, 0, 0.3, 0.1][i % 4])); }
  /* trombone: pode "deslizar" para a nota (deM) e usar a surdina uá-uá */
  function trombone(m, t, dur, vol, deM, wah) {
    const d = Math.max(0.12, dur), fim = t + d + 0.15;
    const o = osc('sawtooth', m, t, fim), o2 = osc('sawtooth', m, t, fim, 5);
    if (deM != null) [o, o2].forEach(x => {
      x.frequency.setValueAtTime(hz(deM), t);
      x.frequency.exponentialRampToValueAtTime(hz(m), t + Math.min(0.18, d * 0.6));
    });
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = wah ? 4 : 1;
    if (wah) {
      f.frequency.setValueAtTime(350, t);
      f.frequency.exponentialRampToValueAtTime(1800, t + Math.min(0.25, d * 0.5));
      f.frequency.exponentialRampToValueAtTime(400, t + d);
    } else {
      f.frequency.setValueAtTime(500, t);
      f.frequency.exponentialRampToValueAtTime(1700, t + 0.06);
    }
    const g = ac.createGain(); env(g, t, 0.03, d + 0.06, Math.min(0.08, d * 0.4), vol);
    const g2 = ac.createGain(); g2.gain.value = 0.5;
    o.connect(f); o2.connect(g2); g2.connect(f);
    vibrato([o, o2], t, d, 10, 5);
    f.connect(g); saidaPara(g, 0.25, -0.3);
  }
  const tromboneAlvo = a => sortear(a.escada.filter(m => m >= 52 && m <= 62));
  /* tuba (o "pum" grave da marchinha) */
  function tuba(m, t, dur, vol) {
    const d = Math.max(0.12, dur), fim = t + d + 0.1;
    const f = ac.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(250, t); f.frequency.linearRampToValueAtTime(650, t + 0.05); f.frequency.exponentialRampToValueAtTime(400, t + d);
    const g = ac.createGain(); env(g, t, 0.03, d, Math.min(0.06, d * 0.4), vol);
    osc('sawtooth', m, t, fim).connect(f);
    const s = ac.createGain(); s.gain.value = 0.7; osc('sine', m, t, fim).connect(s); s.connect(g);
    f.connect(g); saidaPara(g, 0.1);
  }
  /* banjo: batida curta e estalada no contratempo */
  function banjo(a, t, vol) {
    a.vozes.forEach((m, i) => {
      const tt = t + i * 0.007, mm = m + (m < 62 ? 12 : 0);
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.8;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, tt);
      g.gain.exponentialRampToValueAtTime(vol, tt + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.22);
      osc('sawtooth', mm, tt, tt + 0.28).connect(f); f.connect(g); saidaPara(g, 0.1, -0.35);
    });
  }
  /* bloco de madeira */
  function bloco(t, vol, agudo) {
    const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = agudo ? 1250 : 900;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g); saidaPara(g, 0.15, 0.4);
    o.start(t); o.stop(t + 0.09);
    ruido(t, 0.012, vol * 0.5, 'bandpass', 3000, 2, 0.001, 0, 0.4);
  }
  /* prato abafado com a mão (o "tchic" curto) */
  function pratoAbafado(t, vol) { ruido(t, 0.14, vol, 'highpass', 5000, 0.5, 0.001, 0.1, -0.3); }
  /* vibrafone: o som calmo das perguntas (com o "tremido" do motor) */
  function vibrafone(m, t, dur, vol) {
    const d = Math.max(0.8, dur), fim = t + d + 0.1;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    const trem = ac.createGain(); trem.gain.value = 0.7;
    const lfo = ac.createOscillator(); lfo.frequency.value = 5.2;
    const lg = ac.createGain(); lg.gain.value = 0.3;
    lfo.connect(lg); lg.connect(trem.gain); lfo.start(t); lfo.stop(fim);
    osc('sine', m, t, fim).connect(g);
    const h4 = ac.createGain(); h4.gain.value = 0.08; osc('sine', m + 24, t, fim).connect(h4); h4.connect(g);
    g.connect(trem); saidaPara(trem, 0.4, 0.15);
  }
  const quinta = a => a.raizAc + 7 > 47 ? a.raizAc - 5 : a.raizAc + 7;
  /* mão direita do ragtime: a melodia com uma nota do acorde embaixo */
  function pianoMD(a, m, t, d, vol) {
    piano(m, t, d, vol, 0.15);
    const b = a.escada.filter(x => x <= m - 3 && x >= m - 9).pop();
    if (b) piano(b, t, d, vol * 0.6, 0.15);
  }
  /* clarinete fazendo floreios por cima da melodia (dixieland) */
  function floreio(p, t, P, vol) {
    if (p % 2) return;
    if (B.comp % 2 === 1 && p >= 12) return;
    const notas = B.acorde.escada.filter(m => m >= 72 && m <= 91);
    let i = notas.findIndex(m => m >= C.obb);
    if (i < 0) i = notas.length - 1;
    if (i >= notas.length - 1) C.obbDir = -1;
    if (i <= 0) C.obbDir = 1;
    if (chance(0.15)) C.obbDir *= -1;
    i = lim(i + C.obbDir, 0, notas.length - 1);
    const m = notas[i];
    C.obb = m;
    const ts = t + atrasoSw(p, P);
    if (chance(0.15)) clarinete(m - 1, ts - 0.035, 0.04, vol * 0.7);
    clarinete(m, ts, P * 1.7, vol);
  }

  /* ------------------------------------------------------------ DESENHO: um passo */
  function passoDesenho(p, t, P) {
    const a = B.acorde, ts = t + atrasoSw(p, P);
    if (calmo) {
      /* perguntas: vibrafone e contrabaixo, bem de leve */
      if (p === 0) a.vozes.forEach((m, i) => vibrafone(m + (m < 60 ? 12 : 0), t + i * 0.012, 16 * P * 0.95, 0.03));
      if (p === 0 || p === 8) baixoAc(p === 0 ? a.raizAc : quinta(a), t, 8 * P * 0.9, 0.13);
      if (p === 10 && chance(0.3)) vibrafone(sortear(a.escada.filter(m => m >= 72 && m <= 84)), ts, 1.2, 0.025);
      return;
    }
    if (C.sub === 'ragtime') passoRagtime(p, t, ts, P);
    else if (C.sub === 'dixie') passoBanda(p, t, ts, P);
    else passoChefao(p, t, ts, P);
  }

  /* ragtime: o piano carrega tudo; a banda entra a partir da segunda vez */
  function passoRagtime(p, t, ts, P) {
    const T = B.tipo, a = B.acorde, c = B.comp;
    const h = () => (Math.random() - 0.5) * 0.006;
    if (T === 'final' && c >= 2) {
      /* "ta... DAM!" */
      if (c === 2 && p === 0) { acordePiano(a, t, 0.04, 0.2); piano(a.raizAc + 12, t, 0.2, 0.045); tuba(a.raizAc, t, 0.2, 0.2); bumbo(t, 0.5); }
      if (c === 2 && p === 6) {
        const d = 16 * P;
        acordePiano(a, ts, 0.05, d); piano(a.raizAc, ts, d, 0.05); piano(a.raizAc + 12, ts, d, 0.05);
        tuba(a.raizAc, ts, d * 0.6, 0.22); bumbo(ts, 0.7); prato(ts, 0.12);
        const topo = a.escada.find(m => m >= 79 && m % 12 === a.base % 12) || 84;
        for (let x = 0; x < 1.2; x += 0.07) xilofone(topo, ts + x, 0.05 * (1 - x / 1.4));
      }
      return;
    }
    /* mão esquerda "stride": grave nos tempos 1 e 3, acorde nos 2 e 4 */
    if (p === 0) { piano(a.raizAc + 12, t, 0.3, 0.045, -0.15); piano(a.raizAc, t, 0.3, 0.03, -0.15); }
    if (p === 8) piano(quinta(a) + 12, t, 0.3, 0.04, -0.15);
    if (p === 4 || p === 12) acordePiano(a, t + h(), 0.028, 0.18);
    const banda = T !== 'intro';
    if (banda) {
      if (p === 0 || p === 8) { tuba(p === 0 ? a.raizAc : quinta(a), t, 4 * P * 0.9, 0.2); bumbo(t, 0.3); }
      if (p === 4 || p === 12) { banjo(a, t + h(), 0.032); bloco(t, 0.1, p === 12); caixa(t + h(), T === 'trio' ? 0.14 : 0.1); }
      if (p % 2 === 0 && T !== 'A') chimbal(t + h(), p % 4 === 2 ? 0.05 : 0.03, false);
      if (c % 4 === 3 && p >= 12) caixa(t, 0.08 + (p - 12) * 0.04);
      if (c % 4 === 3 && p === 14) pratoAbafado(t, 0.08);
      if (p === 0 && (B.inicio || c % 4 === 0)) prato(t, B.inicio ? 0.09 : 0.06);
    }
    /* melodia: piano (mão direita) no tema, xilofone no trio, clarinete em contracanto na parte B */
    const cel = T === 'B' ? C.rag.B : T === 'trio' ? C.rag.T : C.rag.A;
    if (T === 'trio') melodiaRag(p, t, P, cel, (m, tt, d) => xiloNota(m, tt, d, 0.06));
    else melodiaRag(p, t, P, cel, (m, tt, d) => pianoMD(a, m, tt, d, T === 'intro' ? 0.035 : 0.05));
    if (T === 'B') fraseLonga(p, t, P, (m, tt, d) => clarinete(m, tt, d, 0.04));
    if (p === 8 && ((c % 8 === 7 && T !== 'final') || (T === 'intro' && c === 3) || (T === 'final' && c === 1))) corrida(a, t, P, 0.045);
  }
  /* melodia sincopada do ragtime: a célula de 2 compassos 3 vezes e um fechamento */
  function melodiaRag(p, t, P, cel, tocar) {
    const c8 = B.comp % 8, a = B.acorde;
    if (c8 === 7) return;
    if (c8 === 6) {
      if (p === 0) {
        const raizes = a.escada.filter(m => m >= 64 && m <= 82 && m % 12 === a.base % 12);
        tocar(raizes.reduce((x, y) => Math.abs(y - 72) < Math.abs(x - 72) ? y : x, raizes[0]), t, 12 * P);
      }
      return;
    }
    const barra = B.comp % 2, ritmo = cel.r[barra], k = ritmo.indexOf(p);
    if (k < 0) return;
    const prox = ritmo[k + 1] != null ? ritmo[k + 1] : 16;
    const esc = a.escada.filter(m => m >= 62 && m <= 88);
    const centro = Math.max(0, esc.findIndex(m => m >= 72));
    const m = esc[lim(centro + cel.idx[barra][k] - 3 + (c8 >= 2 && c8 < 4 && barra === 1 ? 1 : 0), 0, esc.length - 1)];
    tocar(m, t, (prox - p) * P * 0.9);
  }

  /* big band de chefão de fase (e a versão em tom menor): energia do começo ao fim */
  function passoChefao(p, t, ts, P) {
    const T = B.tipo, a = B.acorde, c = B.comp, c8 = c % 8, menor = C.sub === 'menor';
    const h = () => (Math.random() - 0.5) * 0.006;
    const tutti = (tt, dur, vol) => {
      acordeMetal(a, tt, dur, vol); fundoSax(a, tt, dur, vol * 0.5);
      acordePiano(a, tt, 0.03, Math.max(0.2, dur)); baixoAc(a.raizAc, tt, Math.max(0.25, dur), 0.22);
    };

    /* final: ataques, a banda toda subindo em escala cromática, o acorde gritado e o último ataque */
    if (T === 'final') {
      if (c === 0 && (p === 0 || p === 6 || p === 12)) { tutti(p === 6 ? ts : t, 0.16, 0.042); bumbo(p === 6 ? ts : t, 0.7); caixa(p === 6 ? ts : t, 0.24); }
      if (c === 1 && p < 8 && p % 2 === 0) { tutti(t, 0.1, 0.035); caixa(t, 0.16 + p * 0.01); bumbo(t, 0.5); }
      if (c === 1 && p >= 8) {
        let alvo = B.proxBase;
        while (alvo < 76) alvo += 12;
        while (alvo > 87) alvo -= 12;
        const m = alvo - (16 - p);
        metal(m, t, P * 0.9, 0.04, false, 0.1); metal(m - 12, t, P * 0.9, 0.025, false, -0.2); sax(m - 5, t, P * 0.9, 0.02, 0.3);
        caixa(t, 0.1 + (p - 8) * 0.03);
      }
      if (c === 2 && p === 0) {
        const d = 16 * P * 1.05;
        const topo = a.escada.find(m => m >= 76 && m % 12 === a.base % 12) || 79;
        grito(a, topo, t, d, 0.045);
        fundoSax(a, t, d, 0.022);
        trombone(a.raizAc + 12, t, d, 0.05, a.raizAc + 5);
        acordePiano(a, t, 0.04, d); baixoAc(a.raizAc, t, d, 0.22);
        bumbo(t, 1); prato(t, 0.16);
        for (let x = 0.06; x < d * 0.8; x += 0.06) caixa(t + x, 0.05 + 0.1 * x / d);
      }
      if (c === 3 && p === 6) { tutti(t, 0.12, 0.05); bumbo(t, 0.9); pratoAbafado(t, 0.16); }
      return;
    }

    /* introdução: fanfarra de ataques e uma corrida de xilofone */
    if (T === 'intro' && c < 2) {
      const ataque = C.ataques.includes(p) || (c === 1 && p >= 10 && p % 2 === 0);
      if (ataque) {
        const tt = p % 4 === 2 ? ts : t;
        tutti(tt, 0.16, 0.045); bumbo(tt, 0.7); caixa(tt, 0.22);
        if (p === 0) prato(t, 0.12);
      } else if (menor && p % 4 === 0) tom(t, 80, 0.26, -0.2);
      if (c === 0 && p === 8) corrida(a, t, P, 0.05);
      return;
    }

    /* solo de tambores, cada vez mais rápido */
    if (T === 'break') {
      const tons = [200, 165, 135, 105, 82], k = (c === 0 ? p / 2 : p) % 5;
      if (c === 1 || p % 2 === 0) tom(c === 0 ? t + atrasoSw(p, P) : t, tons[k | 0], 0.18 + (c * 16 + p) * 0.005, [0.4, 0.2, 0, -0.2, -0.4][k | 0]);
      if (p % 4 === 0) bumbo(t, 0.6);
      if (c === 1 && p === 14) { tutti(t, 0.1, 0.04); caixa(t, 0.3); }
      return;
    }

    /* bateria */
    if (T === 'B') {
      /* "selva": surdo em todos os tempos, tons respondendo, aro da caixa no 2 e no 4 */
      if (p % 4 === 0) tom(t, 78, p % 8 === 0 ? 0.3 : 0.24, -0.2);
      if (p === 6 || p === 14) tom(ts, 110, 0.18, 0.2);
      if (p === 4 || p === 12) caixa(t, 0.13);
      if (p % 4 === 2) chimbal(ts, 0.05, false);
      if (B.ultimo && p >= 8) caixa(t, 0.08 + (p - 8) * 0.03);
    } else if ((c % 4 === 3 || B.ultimo) && p >= 8) {
      /* virada rápida: caixa em semicolcheias crescendo e os tons descendo */
      if (p < 12) caixa(t + h(), 0.1 + (p - 8) * 0.05);
      else tom(t, [200, 160, 125, 95][p - 12], 0.3, [0.4, 0.15, -0.15, -0.4][p - 12]);
      if (p === 8) bumbo(t, 0.6);
    } else {
      const forte = T === 'shout' || T === 'solo' || C.sec === 2;
      if (p % 4 === 0) { conducao(t + h(), forte ? 0.12 : 0.1); bumbo(t, 0.34); }
      if (p % 4 === 2) conducao(ts + h(), forte ? 0.08 : 0.065);
      if (p === 4 || p === 12) { caixa(t + h(), forte ? 0.24 : 0.16); chimbal(t, 0.05, false); }
      else if (p % 4 === 2 && chance(0.3)) caixa(ts + h(), 0.07);
      if (p === 14 && c % 2 === 1) { bumbo(ts, 0.7); if (forte) prato(ts, 0.08); }
    }
    if (p === 0 && (B.inicio || c % 4 === 0)) prato(t, B.inicio ? 0.12 : 0.08);

    /* contrabaixo: caminhando sem parar; na parte "selva", uma figura insistente */
    if (p % 4 === 0) {
      if (T === 'B') baixoAc([a.raizAc, a.raizAc, quinta(a), a.raizAc + a.ints[3] - (a.ints[3] > 11 ? 12 : 0)][p / 4], t, 4 * P * 0.9, 0.21);
      else {
        if (!B.walk) B.walk = linhaWalking(a, B.proxBase);
        baixoAc(B.walk[p / 4], t, 4 * P * 0.95, 0.21);
      }
    }
    /* piano: ataques curtos no ritmo de charleston */
    if (T !== 'B' && (p === 0 || p === 6)) acordePiano(a, p === 6 ? ts : t, 0.022, 0.22);

    /* melodias: metais e saxofones se revezando, com respostas */
    const metais = vol => (m, tt, d, g) => g ? metal(m, tt, d, 0.025) : d > 10 * P ? grito(a, m, tt, d, vol) : naipe(a, m, tt, d, vol);
    const saxes = vol => (m, tt, d, g) => g ? sax(m, tt, d, 0.02) : naipeSax(a, m, tt, d, vol);
    const responde = c % 2 === 1 && c8 < 6;
    if (T === 'intro') {
      /* a banda engrena; um trompete grita por cima */
      if (C.resp.includes(p)) acordeMetal(a, ts, 0.14, 0.035);
      if (c === 2 && p === 0) {
        const topo = a.escada.find(m => m >= 81 && m <= 89) || 84;
        metal(topo, t, 28 * P, 0.045, false, 0.15, { tremido: true, queda: true });
      }
    } else if (T === 'A') {
      if (C.sec === 1) {
        frase(p, t, P, metais(0.042), C.quente);
        if (responde) lickSax(p, t, P, 0.03);
      } else {
        frase(p, t, P, saxes(0.036), C.quente);
        if (responde && C.resp.includes(p)) acordeMetal(a, ts, 0.14, 0.036);
      }
      if (c8 === 7 && p === 8) corrida(a, t, P, 0.045);
    } else if (T === 'B') {
      fraseLonga(p, t, P, menor ? (m, tt, d) => clarinete(m, tt, d, 0.06)
        : (m, tt, d) => trombone(m - 12 >= 50 ? m - 12 : m, tt, d, 0.055, null, true));
      if (p === 14 && c % 2 === 0) acordeMetal(a, ts, 0.12, 0.032);
      if (p === 0 && c % 2 === 1) fundoSax(a, t, 16 * P * 0.9, 0.014);
    } else if (T === 'solo') {
      improviso(p, t, P, menor ? (m, tt, d) => clarinete(m, tt, d, 0.055) : (m, tt) => xilofone(m, tt, 0.06));
      if (c % 2 === 0 && (p === 0 || p === 6)) acordeMetal(a, p === 6 ? ts : t, 0.12, 0.03);
      if (c % 2 === 1 && p === 14) acordeMetal(a, ts, 0.1, 0.03);
    } else if (T === 'shout') {
      /* todos juntos: metais na melodia, saxofones uma oitava abaixo */
      frase(p, t, P, (m, tt, d, g) => {
        metais(0.045)(m, tt, d, g);
        if (!g) sax(m - 12, tt, d, 0.025, -0.25);
      }, C.quente);
      if (p === 0 && c % 2 === 0) { const alvo = tromboneAlvo(a); if (alvo) trombone(alvo, t, 6 * P, 0.05, alvo - 7); }
      if (responde && p === 14) acordeMetal(a, ts, 0.1, 0.035);
      if (c8 === 7 && p === 8) corrida(a, t, P, 0.05);
    }
  }
  /* os saxofones respondem com 4 colcheias no fim do compasso */
  function lickSax(p, t, P, vol) {
    if (p < 8 || p % 2) return;
    const a = B.acorde, esc = a.escada.filter(m => m >= 60 && m <= 82);
    const centro = Math.max(0, esc.findIndex(m => m >= 68));
    const m = esc[lim(centro + C.lick[(p - 8) / 2], 0, esc.length - 1)];
    naipeSax(a, m, t + atrasoSw(p, P), 2 * P * 0.9, vol);
  }

  /* dixieland */
  function passoBanda(p, t, ts, P) {
    const T = B.tipo, a = B.acorde, c = B.comp, sub = C.sub, dixie = sub === 'dixie', menor = sub === 'menor';
    const h = () => (Math.random() - 0.5) * 0.008;

    /* final: ataques, rufo, o acorde longo e o último ataque curto */
    if (T === 'final') {
      if (c < 2 && (p === 0 || p === 6)) {
        const tt = p === 6 ? ts : t;
        acordeMetal(a, tt, 0.2, 0.04); acordePiano(a, tt, 0.03, 0.25);
        if (dixie) { tuba(a.raizAc, tt, 0.3, 0.22); banjo(a, tt, 0.04); } else baixoAc(a.raizAc, tt, 0.3, 0.2);
        caixa(tt, 0.2); bumbo(tt, 0.6);
      }
      if (c === 1 && p >= 8) caixa(t, 0.06 + (p - 8) * 0.03);
      if (c === 1 && p === 8 && !dixie) corrida(a, t, P, 0.04);
      if (c === 2 && p === 0) {
        const d = 16 * P * 1.05;
        acordeMetal(a, t, d, 0.03);
        const topo = a.escada.find(m => m >= 76 && m % 12 === a.base % 12);
        if (topo) metal(topo, t, d, 0.045, false, 0);
        fundoSax(a, t, d, 0.02);
        trombone(a.raizAc + 12, t, d, 0.05, a.raizAc + 5);
        acordePiano(a, t, 0.04, d);
        if (dixie) tuba(a.raizAc, t, d, 0.22); else baixoAc(a.raizAc, t, d, 0.22);
        bumbo(t, 0.9); prato(t, 0.15);
      }
      if (c === 3 && p === 6) {
        acordeMetal(a, t, 0.12, 0.045); bumbo(t, 0.8); pratoAbafado(t, 0.14);
        if (dixie) tuba(a.raizAc, t, 0.2, 0.22); else baixoAc(a.raizAc, t, 0.2, 0.22);
      }
      return;
    }

    /* introdução */
    if (T === 'intro' && c < 2) {
      if (menor) {
        /* tambores "da selva" no surdo */
        if ([0, 4, 8, 10, 12].includes(p)) tom(t, 78, p === 0 ? 0.32 : 0.22, -0.2);
        if (p === 0 || p === 8) baixoAc(a.raizAc, t, 0.4, 0.2);
        if (c === 1 && p === 0) fundoSax(a, t, 16 * P * 0.95, 0.02);
      } else if (C.ataques.includes(p)) {
        acordeMetal(a, ts, 0.2, 0.04); bumbo(ts, 0.6); caixa(ts, 0.2);
        if (dixie) { tuba(a.raizAc, ts, 0.25, 0.22); banjo(a, ts, 0.04); } else baixoAc(a.raizAc, ts, 0.25, 0.2);
        if (p === 0) prato(t, 0.1);
      }
      if (c === 1 && p === 8 && sub === 'bigband') corrida(a, t, P, 0.04);
      if (c === 1 && p >= 12 && dixie) caixa(ts, 0.1 + (p - 12) * 0.04);
      return;
    }

    /* solo de bateria */
    if (T === 'break') {
      if (p % 2 === 0) {
        const tt = p % 4 === 2 ? ts : t;
        if (menor) tom(tt, p % 8 === 0 ? 70 : 95, p % 8 === 0 ? 0.32 : 0.22, p % 4 ? 0.3 : -0.3);
        else if (c === 0) { if (p % 4 === 0) bumbo(tt, 0.6); else caixa(tt, 0.25); if (p === 6 || p === 14) pratoAbafado(tt, 0.08); }
        else if (p < 8) caixa(tt, 0.15 + p * 0.02);
        else tom(tt, [200, 160, 130, 100][(p - 8) / 2], 0.28, [0.4, 0.1, -0.1, -0.4][(p - 8) / 2]);
      }
      return;
    }

    /* breques: a banda só ataca no tempo 1 e deixa o solista sozinho */
    const breque = (dixie && T === 'solo' && c < 4) || (!dixie && T === 'B' && c < 2);

    /* bateria */
    if (breque) {
      if (p === 0) { bumbo(t, 0.6); caixa(t, 0.18); pratoAbafado(t, 0.1); }
    } else if (B.ultimo && p >= 8) {
      if (p % 2 === 0) {
        const k = (p - 8) / 2, tt = p % 4 === 2 ? ts : t;
        if (k < 2) caixa(tt + h(), 0.12 + k * 0.06); else tom(tt, k === 2 ? 180 : 120, 0.24, k === 2 ? 0.3 : -0.3);
      }
      if (p === 8) bumbo(t, 0.5);
    } else if (dixie) {
      if (p === 0 || p === 8) bumbo(t, 0.3);
      if (p === 4 || p === 12) { caixa(t + h(), T === 'shout' ? 0.2 : 0.13); if (chance(0.4)) caixa(t + P * 0.5, 0.05); }
      if (T === 'shout' || C.sec === 2) { if (p % 4 === 0) conducao(t + h(), 0.09); if (p % 4 === 2) conducao(ts + h(), 0.06); }
      else { if (p % 4 === 0) bloco(t, 0.08, p % 8 === 4); if (p % 4 === 2) chimbal(ts + h(), 0.05, false); }
      if (c % 4 === 3 && p >= 12 && p % 2 === 0) caixa(p % 4 === 2 ? ts : t, 0.12 + (p - 12) * 0.04);
      if (p === 14 && c % 4 === 3) pratoAbafado(ts, 0.1);
    } else if (menor && T === 'A' && C.sec === 1) {
      /* primeira vez do tema menor: tambores da selva */
      if (p % 4 === 0) tom(t, 78, p % 8 === 0 ? 0.28 : 0.2, -0.2);
      if (p === 10 || p === 14) tom(ts, 78, 0.16, -0.2);
      if (p === 4 || p === 12) chimbal(t, 0.05, false);
    } else {
      const forte = T === 'shout';
      if (p % 4 === 0) conducao(t + h(), forte ? 0.11 : 0.08);
      if (p === 6 || p === 14) conducao(ts + h(), forte ? 0.07 : 0.05);
      if (p === 4 || p === 12) chimbal(t, 0.06, false);
      if (p % 4 === 0) bumbo(t, forte ? (p % 8 === 0 ? 0.5 : 0.3) : 0.2);
      if (forte && (p === 4 || p === 12)) caixa(t + h(), 0.2);
      else if (p % 4 === 2 && chance(0.28)) caixa(ts + h(), 0.07);
      if (forte && p === 14 && c % 2 === 1) { bumbo(ts, 0.7); prato(ts, 0.1); }
    }
    if (p === 0 && ((B.inicio && T !== 'intro') || (T === 'intro' && c === 2))) prato(t, 0.09);

    /* grave: tuba "a dois" no dixieland; contrabaixo caminhando na big band */
    if (dixie) {
      if ((p === 0 || p === 8) && (!breque || p === 0)) tuba(p === 0 ? a.raizAc : quinta(a), t, breque ? 0.3 : 6 * P, 0.2);
    } else {
      if (!B.walk) B.walk = linhaWalking(a, B.proxBase);
      if (breque) { if (p === 0) baixoAc(a.raizAc, t, 0.3, 0.21); }
      else if (p % 4 === 0) {
        const k = p / 4, dois = T === 'intro' || (T === 'A' && C.sec === 1);
        if (!dois) baixoAc(B.walk[k], t, 4 * P * 0.95, 0.2);
        else if (k === 0 || k === 2) baixoAc(k === 0 ? B.walk[0] : quinta(a), t, 8 * P * 0.9, 0.21);
      }
    }

    /* acompanhamento: banjo no dixieland; piano leve na big band */
    if (breque) {
      if (p === 0) { acordePiano(a, t, 0.03, 0.3); if (dixie) banjo(a, t, 0.04); else acordeMetal(a, t, 0.15, 0.03); }
    } else if (dixie) {
      if (p === 4 || p === 12) banjo(a, t + h(), 0.032);
      if (p === 0 || p === 8) acordePiano(a, t, 0.018, 0.2);
    } else if (p === 0 || p === 6) acordePiano(a, p === 6 ? ts : t, T === 'shout' ? 0.018 : 0.024, 0.25);

    /* melodias */
    const corridaFim = B.comp % 8 === 7 && p === 8;
    if (dixie) {
      if (T === 'A' || T === 'shout') {
        frase(p, t, P, (m, tt, d, g) => metal(m, tt, d, g ? 0.025 : (T === 'shout' ? 0.055 : 0.05), false, 0.1));
        floreio(p, t, P, T === 'shout' ? 0.03 : 0.022);
        if (p === 0 && c % 2 === 0) { const alvo = tromboneAlvo(a); if (alvo) trombone(alvo, t, 6 * P, 0.045, alvo - 7); }
        if (corridaFim) corrida(a, t, P, 0.045);
      } else if (T === 'solo') {
        improviso(p, t, P, (m, tt, d) => clarinete(m, tt, d, 0.055));
      } else if (T === 'B') {
        fraseLonga(p, t, P, (m, tt, d) => trombone(m - 12 >= 50 ? m - 12 : m, tt, d, 0.05, null, false));
        floreio(p, t, P, 0.025);
      } else if (T === 'intro') floreio(p, t, P, 0.022);
    } else if (T === 'A') {
      if (C.sec === 1) {
        /* primeira vez: saxofones em 4 vozes (no menor, o clarinete), com os metais respondendo */
        frase(p, t, P, menor ? (m, tt, d, g) => clarinete(m, tt, d, g ? 0.03 : 0.06)
          : (m, tt, d, g) => g ? sax(m, tt, d, 0.02) : naipeSax(a, m, tt, d, 0.035));
        if (c % 2 === 1 && C.resp.includes(p)) acordeMetal(a, ts, 0.14, 0.03);
      } else {
        /* segunda vez: os trompetes pegam a melodia, os saxofones fazem o fundo */
        frase(p, t, P, (m, tt, d, g) => g ? metal(m, tt, d, 0.025) : naipe(a, m, tt, d, 0.042));
        if (p === 0 && c % 2 === 0) fundoSax(a, t, 32 * P * 0.9, 0.012);
      }
      if (corridaFim) corrida(a, t, P, 0.04);
    } else if (T === 'B') {
      fraseLonga(p, t, P, (m, tt, d) => trombone(m - 12 >= 50 ? m - 12 : m, tt, d, 0.055, null, true));
      if (p === 0 && c % 2 === 1 && !breque) fundoSax(a, t, 16 * P * 0.9, 0.012);
    } else if (T === 'solo') {
      improviso(p, t, P, menor ? (m, tt, d) => clarinete(m, tt, d, 0.055) : (m, tt) => xilofone(m, tt, 0.06));
    } else if (T === 'shout') {
      frase(p, t, P, (m, tt, d, g) => g ? metal(m, tt, d, 0.025) : naipe(a, m, tt, d, 0.045));
      if (p === 0 && c % 4 === 0) { const alvo = tromboneAlvo(a); if (alvo) trombone(alvo, t, 8 * P, 0.05, alvo - 7); }
      if (corridaFim) corrida(a, t, P, 0.045);
    }
  }

  /* ------------------------------------------------------------ ÉPICO: um passo */
  function passoEpico(p, t, P) {
    const T = B.tipo, a = B.acorde, c = B.comp, N = B.passos;
    if (ecoPasso !== P) { eco.tempo.delayTime.setValueAtTime(3 * P, t); ecoPasso = P; }
    const h = () => (Math.random() - 0.5) * 0.006;
    const arpNota = a.arp[C.arp[p % C.arp.length]];
    const pan = p % 2 ? 0.35 : -0.35;

    if (calmo) {
      if (p === 0) { acordeTeclado(a, t, N * P + 0.6, 0.02, 900); baixoSub(a.raiz, t, N * P * 0.9, 0.12); }
      if (p % 2 === 0) sint(arpNota, t, P * 1.5, 0.016, 700, pan);
      return;
    }

    const prog = (c * N + p) / (B.n * N);   /* quanto da parte já passou (0 a 1) */

    /* teclado */
    if (p === 0 && T !== 'groove') {
      const v = T === 'drop' ? 0.016 : T === 'build' ? 0.022 : 0.028;
      acordeTeclado(a, t, N * P + 0.6, v, T === 'drop' ? 1600 : 1100);
    }

    /* arpejo: o filtro vai abrindo e fechando conforme a parte */
    let corte = 1600, vArp = 0.035;
    if (T === 'intro') { corte = 350 + prog * 2200; vArp = 0.04; }
    else if (T === 'build') corte = 1400 + prog * 2600;
    else if (T === 'drop') { corte = 3200; vArp = 0.026; }
    else if (T === 'quebra') { corte = 1200 + 500 * Math.sin(prog * Math.PI); vArp = 0.04; }
    else if (T === 'outro') { corte = 2400 - prog * 1900; vArp = 0.04 * (1 - prog * 0.7); }
    sint(arpNota, t + h(), P * 1.6, vArp, corte, pan);

    /* efeitos de transição */
    if (p === 0 && c === 0 && T === 'drop') { impacto(t, 0.5); prato(t, 0.16); }
    if (p === 0 && c === 0 && T === 'build') subida(t, B.n * N * P, 0.1);
    if (p === 0 && c === 2 && T === 'intro') subida(t, 2 * N * P, 0.05);
    if (p === 0 && c === 0 && T === 'outro') impacto(t, 0.35);

    /* bateria */
    const riff = c % 4 === 3 ? C.riffB : C.riffA;
    if (T === 'groove') {
      const virada = B.ultimo && p >= N - 4;
      if (virada) tom(t, [180, 150, 120, 95][p - (N - 4)], 0.26, [0.4, 0.15, -0.15, -0.4][p - (N - 4)]);
      else {
        if (p === 0 || C.riffA[p] === 2) bumbo(t, 0.8);
        if (p === 8) caixa(t, 0.3);
        if (p % 2 === 0) chimbal(t + h(), p % 4 === 0 ? 0.05 : 0.07, false);
      }
    } else if (T === 'build') {
      const cada = c < 2 ? 4 : c < 3 ? 2 : 1;
      if (p % cada === 0) caixa(t, 0.08 + prog * 0.26);
      if (p % 4 === 0) bumbo(t, 0.7);
    } else if (T === 'drop') {
      if (riff[p]) bumbo(t, riff[p] === 2 ? 0.95 : 0.7);
      const caixas = C.meioTempo ? [8] : (N === 14 ? [4, 10] : [4, 12]);
      if (caixas.includes(p)) caixa(t, 0.34);
      if (p % 2 === 0) conducao(t + h(), 0.07);
      if (p === 0 && c === 4) prato(t, 0.13);
    }

    /* baixo */
    if (T === 'groove') { if (p % 2 === 0) baixoSub(a.raiz + (p === N - 2 ? 12 : 0), t, 2 * P * 0.8, 0.2); }
    else if (T === 'drop') { if (riff[p]) baixoSub(a.raiz, t, P * (riff[p] === 2 ? 2 : 1) * 0.9, 0.24); }
    else if (T === 'build') { if (p % (c < 3 ? 2 : 1) === 0) baixoSub(a.raiz, t, P * 0.9, 0.18); }
    else if ((T === 'quebra' || T === 'outro' || (T === 'intro' && c >= 2)) && p === 0) baixoSub(a.raiz, t, N * P * 0.95, 0.18);

    /* guitarra pesada */
    if (T === 'drop') { if (riff[p]) guitarra(a.raiz, t, riff[p] === 2 ? 3 * P : 0, riff[p] === 2 ? 0.2 : 0.24, riff[p] !== 2); }
    else if (T === 'groove' && c >= 4) { if (C.riffA[p] === 2) guitarra(a.raiz, t, 4 * P, 0.17, false); }
    else if (T === 'build' && B.ultimo && p === 0) guitarra(a.raiz, t, N * P, 0.18, false);

    /* solo de sintetizador no drop */
    if (T === 'drop') ganchoEpico(p, t, P);
  }

  function ganchoEpico(p, t, P) {
    const N = B.passos, a = B.acorde;
    const pos = (B.comp % 2) * N + p;
    const G = C.gancho, k = G.ritmo.findIndex(([s]) => s === pos);
    if (k < 0) return;
    let grau = G.graus[k];
    if (k === G.ritmo.length - 1 && B.comp % 4 === 3) grau = grau >= 4 ? 7 : 0;   /* fecha a frase em casa */
    const base = C.tom < 60 ? C.tom + 12 : C.tom;
    let m = base + Math.floor(grau / 7) * 12 + MENOR[grau % 7];
    if (p === 0 && !a.pcs.includes(m % 12)) {
      const v = [m - 1, m + 1, m - 2, m + 2].find(x => a.pcs.includes(x % 12) && MENOR.includes(grauDe(x)));
      if (v) m = v;
    }
    const de = C.ultimaLider != null && Math.abs(m - C.ultimaLider) <= 5 && chance(0.5) ? C.ultimaLider : null;
    lider(m, t, G.ritmo[k][1] * P, 0.075, de);
    C.ultimaLider = m;
  }

  /* ------------------------------------------------------------ agenda */
  function agendar() {
    if (!rodando || !ac) return;
    /* olha 1,8 s à frente (aguenta o navegador atrasar o relógio) */
    const limite = ac.currentTime + 1.8;
    if (proximo < ac.currentTime) proximo = ac.currentTime + 0.05;
    while (proximo < limite) {
      if (pb === 0) novoCompasso(proximo);
      const P = passoDur();
      const passoDe = C.estilo === 'desenho' ? passoDesenho : C.estilo === 'swing' ? passoSwing : passoEpico;
      try { passoDe(pb, proximo, P); } catch (e) { console.error(e); }
      proximo += P;
      pb = (pb + 1) % B.passos;
    }
  }

  /* pedal de distorção + caixa do amplificador; devolve a entrada */
  function pedal(k, corte, saida, molhado, pan) {
    const ent = ac.createGain();
    const ws = ac.createWaveShaper();
    const n = 2048, curva = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; curva[i] = Math.tanh(k * x) / Math.tanh(k); }
    ws.curve = curva; ws.oversample = '4x';
    const grave = ac.createBiquadFilter(); grave.type = 'highpass'; grave.frequency.value = 90;
    const meio = ac.createBiquadFilter(); meio.type = 'peaking'; meio.frequency.value = 1400; meio.Q.value = 0.9; meio.gain.value = 3;
    const amp1 = ac.createBiquadFilter(); amp1.type = 'lowpass'; amp1.frequency.value = corte; amp1.Q.value = 0.7;
    const amp2 = ac.createBiquadFilter(); amp2.type = 'lowpass'; amp2.frequency.value = corte * 1.3; amp2.Q.value = 0.5;
    const sai = ac.createGain(); sai.gain.value = saida;
    ent.connect(ws); ws.connect(grave); grave.connect(meio); meio.connect(amp1); amp1.connect(amp2); amp2.connect(sai);
    saidaPara(sai, molhado, pan);
    return ent;
  }
  /* eco com repetições que vão escurecendo */
  function criarEco() {
    const ent = ac.createGain();
    const tempo = ac.createDelay(2); tempo.delayTime.value = 0.35;
    const volta = ac.createGain(); volta.gain.value = 0.42;
    const escuro = ac.createBiquadFilter(); escuro.type = 'lowpass'; escuro.frequency.value = 2600;
    const fino = ac.createBiquadFilter(); fino.type = 'highpass'; fino.frequency.value = 250;
    ent.connect(tempo); tempo.connect(escuro); escuro.connect(fino); fino.connect(volta); volta.connect(tempo);
    const sai = ac.createGain(); sai.gain.value = 0.7;
    fino.connect(sai); saidaPara(sai, 0.3, -0.55);
    ent.tempo = tempo;
    return ent;
  }

  function montar() {
    if (ac) return true;
    ac = window.Som && Som.contexto ? Som.contexto() : null;
    if (!ac) return false;
    bus = ac.createGain(); bus.gain.value = 0;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -20; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.25;
    seco = ac.createGain(); seco.gain.value = 1;
    mix = ac.createGain(); mix.gain.value = 1;
    /* sala (reverberação) em estéreo, feita com ruído que vai sumindo */
    verb = ac.createConvolver();
    const dur = 2.4, n = ac.sampleRate * dur;
    const ir = ac.createBuffer(2, n, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.8);
    }
    verb.buffer = ir;
    ruidoBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const rd = ruidoBuf.getChannelData(0);
    for (let i = 0; i < rd.length; i++) rd[i] = Math.random() * 2 - 1;
    const voltaVerb = ac.createGain(); voltaVerb.gain.value = 0.3;
    /* equalização final: menos grave embolado e mais brilho */
    const eqGrave = ac.createBiquadFilter(); eqGrave.type = 'lowshelf'; eqGrave.frequency.value = 120; eqGrave.gain.value = -3;
    const eqBrilho = ac.createBiquadFilter(); eqBrilho.type = 'highshelf'; eqBrilho.frequency.value = 4000; eqBrilho.gain.value = 5;
    seco.connect(mix); verb.connect(voltaVerb); voltaVerb.connect(mix);
    /* caminho moderno: estéreo, com brilho */
    caminhoModerno = ac.createGain(); caminhoModerno.gain.value = 1;
    mix.connect(caminhoModerno); caminhoModerno.connect(eqGrave); eqGrave.connect(eqBrilho); eqBrilho.connect(comp);
    /* caminho de disco antigo: faixa estreita e "nasal", válvula, rotação que oscila e mono */
    caminhoAntigo = ac.createGain(); caminhoAntigo.gain.value = 0;
    const semGrave = ac.createBiquadFilter(); semGrave.type = 'highpass'; semGrave.frequency.value = 110;
    const nasal = ac.createBiquadFilter(); nasal.type = 'peaking'; nasal.frequency.value = 1800; nasal.Q.value = 0.8; nasal.gain.value = 3;
    const semAgudo1 = ac.createBiquadFilter(); semAgudo1.type = 'lowpass'; semAgudo1.frequency.value = 7500; semAgudo1.Q.value = 0.7;
    const semAgudo2 = ac.createBiquadFilter(); semAgudo2.type = 'lowpass'; semAgudo2.frequency.value = 9500; semAgudo2.Q.value = 0.5;
    const valvula = ac.createWaveShaper();
    const cv = new Float32Array(1024);
    for (let i = 0; i < cv.length; i++) { const x = i / (cv.length - 1) * 2 - 1; cv[i] = Math.tanh(1.8 * x) / Math.tanh(1.8); }
    valvula.curve = cv;
    const rotacao = ac.createDelay(0.1); rotacao.delayTime.value = 0.02;
    [[0.5, 0.0015], [6.5, 0.00007]].forEach(([f, prof]) => {
      const l = ac.createOscillator(); l.frequency.value = f;
      const lg = ac.createGain(); lg.gain.value = prof;
      l.connect(lg); lg.connect(rotacao.delayTime); l.start();
    });
    const mono = ac.createGain(); mono.channelCount = 1; mono.channelCountMode = 'explicit'; mono.channelInterpretation = 'speakers';
    mix.connect(caminhoAntigo); caminhoAntigo.connect(semGrave); semGrave.connect(nasal); nasal.connect(semAgudo1);
    semAgudo1.connect(semAgudo2); semAgudo2.connect(valvula); valvula.connect(rotacao); rotacao.connect(mono); mono.connect(comp);
    /* chiado e estalos do disco de vinil */
    const sr = ac.sampleRate, disco = ac.createBuffer(1, sr * 4, sr), dd = disco.getChannelData(0);
    for (let i = 0; i < dd.length; i++) dd[i] = (Math.random() * 2 - 1) * 0.012;
    for (let k = 0; k < 34; k++) {
      const pos = (Math.random() * (dd.length - 4)) | 0, amp = (0.15 + 0.85 * Math.pow(Math.random(), 3)) * (chance(0.5) ? 1 : -1);
      dd[pos] += amp; dd[pos + 1] -= amp * 0.6; dd[pos + 2] += amp * 0.25;
    }
    const agulha = ac.createBufferSource(); agulha.buffer = disco; agulha.loop = true;
    const chiadoF = ac.createBiquadFilter(); chiadoF.type = 'bandpass'; chiadoF.frequency.value = 2500; chiadoF.Q.value = 0.5;
    const chiadoV = ac.createGain(); chiadoV.gain.value = 0.25;
    chiado = ac.createGain(); chiado.gain.value = 0;
    agulha.connect(chiadoF); chiadoF.connect(chiadoV); chiadoV.connect(chiado); chiado.connect(comp);
    agulha.start();
    saidaEstilo = ac.createGain(); saidaEstilo.gain.value = 1;
    comp.connect(saidaEstilo); saidaEstilo.connect(bus); bus.connect(ac.destination);
    guitE = pedal(8, 3800, 0.12, 0.1, -0.7);
    guitD = pedal(8, 3800, 0.12, 0.1, 0.7);
    eco = criarEco();
    ecoPasso = 0;
    return true;
  }

  function alvo() {
    if (pausada || !liberada) return 0;
    const base = NIVEIS[nivel] * fatorTela;
    /* durante um efeito do jogo, a música quase some */
    return performance.now() < duckAte ? base * 0.2 : base;
  }
  function aplicar(seg) {
    const v = alvo();
    if (v > 0 && !rodando) iniciar();
    if (!ac || !bus) return;
    const t = ac.currentTime;
    bus.gain.cancelScheduledValues(t);
    bus.gain.setValueAtTime(bus.gain.value, t);
    bus.gain.setTargetAtTime(v, t, (seg || 1.2) / 3);
    if (v === 0 && rodando) {
      clearTimeout(desligarTimer);
      desligarTimer = setTimeout(() => { if (alvo() === 0) parar(); }, (seg || 1.2) * 1000 + 600);
    }
  }

  function iniciar() {
    if (!montar()) return;
    rodando = true;
    pb = 0;
    proximo = ac.currentTime + 0.1;
    agendar();
    clearInterval(timer);
    timer = setInterval(agendar, 250);
  }
  function parar() {
    rodando = false;
    clearInterval(timer); timer = null;
  }

  /* abaixa enquanto toca um efeito (acerto, erro, suspense...) */
  Som.aoEfeito = seg => {
    if (!rodando) return;
    duckAte = performance.now() + seg * 1000;
    aplicar(0.15);
    setTimeout(() => aplicar(1.5), seg * 1000 + 20);
  };

  /* o navegador só deixa tocar som depois do primeiro clique ou tecla */
  function liberar() {
    if (liberada) return;
    liberada = true;
    aplicar(3);
  }
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, liberar, { capture: true }));

  return {
    NIVEIS,
    TRILHAS,
    get trilha() { return trilha; },
    /* trocar a trilha começa uma canção nova da trilha escolhida no próximo compasso */
    set trilha(v) { if (v in TRILHAS && v !== trilha) { trilha = v; trocarTrilha = true; } },
    get nivel() { return nivel; },
    set nivel(v) { if (v in NIVEIS) { nivel = v; aplicar(1); } },
    /* chamada a cada troca de tela */
    tela(nome) {
      fatorTela = POR_TELA[nome] != null ? POR_TELA[nome] : 0.6;
      calmo = !!CALMAS[nome];
      aplicar(1.5);
    },
    /* a vinheta de abertura pede silêncio e depois devolve a música */
    pausar(sim) { pausada = !!sim; aplicar(sim ? 0.5 : 4); },
    liberar,
    get tocando() { return rodando && alvo() > 0; },
    /* para testes: em que parte da canção está */
    get estado() { return C && B ? { estilo: C.estilo + (C.sub ? ':' + C.sub : ''), tom: B.tom, bpm: C.bpm, compasso7: C.passos === 14, parte: B.tipo, compasso: B.comp + 1, calmo } : null; }
  };
})();
