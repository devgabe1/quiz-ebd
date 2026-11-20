/* Perguntas da casa: quem vai comandar o jogo pode desligar perguntas e criar as suas.
   Tudo fica só neste navegador (localStorage), nunca vai para o site; dá para levar
   para outro computador exportando e importando um arquivo .json.

   Como funciona: as perguntas originais (js/dados.js) continuam no mesmo lugar, só
   ganham a marca _off quando desligadas; as perguntas novas entram no fim da lista de
   cada jogo, com a marca _nova. Assim o progresso salvo e as versões da Bíblia
   (js/versoes.js), que usam a posição das perguntas originais, continuam valendo. */
(function () {
  'use strict';

  const CHAVE = 'quiz-ebd-perguntas-v1';
  const FINAL = 'final';
  const MODULOS = {};
  window.QUIZ.modulos.forEach(m => { MODULOS[m.id] = m; });
  const lista = id => (id === FINAL ? window.QUIZ.final : MODULOS[id].perguntas);
  const ORIGINAIS = {};
  Object.keys(MODULOS).concat(FINAL).forEach(id => { ORIGINAIS[id] = lista(id).length; });

  /* ------------------------------------------------ formulários de pergunta nova */
  /* tipos de campo: texto, area, numero, vf, opcoes (a 1ª é a certa), linhas, escolha */
  const VF = [['true', 'Verdade'], ['false', 'Mentira']];
  const FORMULARIOS = {
    tanabiblia: [
      { k: 'frase', rot: 'Frase', tipo: 'area', obrig: true, ex: 'Jonas ficou três dias dentro de um grande peixe.' },
      { k: 'resposta', rot: 'Está na Bíblia?', tipo: 'vf', opcoes: [['true', 'Está na Bíblia'], ['false', 'Não está']] },
      { k: 'versiculo', rot: 'Referência', tipo: 'texto', ex: 'Jonas 1:17' },
      { k: 'explicacao', rot: 'Explicação (aparece depois)', tipo: 'area' }
    ],
    aconteceu: [
      { k: 'frase', rot: 'Fato', tipo: 'area', obrig: true, ex: 'Um machado de ferro boiou na água.' },
      { k: 'resposta', rot: 'Aconteceu?', tipo: 'vf', opcoes: [['true', 'Aconteceu'], ['false', 'Não aconteceu']] },
      { k: 'versiculo', rot: 'Referência', tipo: 'texto', ex: '2 Reis 6:5-7' },
      { k: 'explicacao', rot: 'Explicação (aparece depois)', tipo: 'area' }
    ],
    quemdisse: [
      { k: 'frase', rot: 'Frase', tipo: 'area', obrig: true },
      { k: 'opcoes', rot: 'Quem disse', tipo: 'opcoes', n: 4, obrig: true, nomes: ['Quem disse (a certa)', 'Errada', 'Errada', 'Errada'] },
      { k: 'versiculo', rot: 'Referência', tipo: 'texto' },
      { k: 'contexto', rot: 'Contexto (aparece depois)', tipo: 'area' }
    ],
    emoji: [
      { k: 'emojis', rot: 'Emojis', tipo: 'texto', obrig: true, ex: '🐳 🙏 🏙️' },
      { k: 'resposta', rot: 'Que história é', tipo: 'texto', obrig: true, ex: 'Jonas e o grande peixe' },
      { k: 'testamento', rot: 'Testamento', tipo: 'escolha', opcoes: [['Antigo Testamento', 'Antigo'], ['Novo Testamento', 'Novo']] },
      { k: 'dica', rot: 'Dica', tipo: 'texto', obrig: true },
      { k: 'versiculo', rot: 'Referência', tipo: 'texto' }
    ],
    numeros: [
      { k: 'emoji', rot: 'Emoji', tipo: 'texto', ex: '🔢', curto: true },
      { k: 'titulo', rot: 'Título', tipo: 'texto', obrig: true },
      { k: 'pergunta', rot: 'Pergunta', tipo: 'area', obrig: true },
      { k: 'resposta', rot: 'Resposta (número)', tipo: 'numero', obrig: true },
      { k: 'unidade', rot: 'Unidade', tipo: 'texto', ex: 'anos, pessoas, dias…', curto: true },
      { k: 'versiculo', rot: 'Referência', tipo: 'texto' },
      { k: 'curiosidade', rot: 'Curiosidade (aparece depois)', tipo: 'area' }
    ],
    versiculo: [
      { k: 'texto', rot: 'Versículo (as palavras são embaralhadas)', tipo: 'area', obrig: true },
      { k: 'versiculo', rot: 'Referência', tipo: 'texto', obrig: true }
    ],
    intruso: [
      { k: 'itens', rot: 'Itens', tipo: 'opcoes', n: 4, obrig: true, nomes: ['Do grupo', 'Do grupo', 'Do grupo', 'O intruso'], intrusoNoFim: true },
      { k: 'grupo', rot: 'O que os 3 têm em comum', tipo: 'texto', obrig: true },
      { k: 'explicacao', rot: 'Por que o intruso não combina', tipo: 'area' }
    ],
    cardapio: [
      { k: 'emoji', rot: 'Emoji do prato', tipo: 'texto', ex: '🍲', curto: true },
      { k: 'prato', rot: 'Nome do prato', tipo: 'texto', obrig: true },
      { k: 'descricao', rot: 'Descrição', tipo: 'area', obrig: true },
      { k: 'opcoes', rot: 'Quem comeu', tipo: 'opcoes', n: 4, obrig: true, nomes: ['Quem comeu (a certa)', 'Errada', 'Errada', 'Errada'] },
      { k: 'versiculo', rot: 'Referência', tipo: 'texto' },
      { k: 'curiosidade', rot: 'Curiosidade (aparece depois)', tipo: 'area' }
    ],
    perfil: [
      { k: 'nome', rot: 'Personagem (a resposta)', tipo: 'texto', obrig: true },
      { k: 'avatar', rot: 'Emoji do perfil', tipo: 'texto', ex: '🙂', curto: true },
      { k: 'usuario', rot: 'Nome de usuário', tipo: 'texto', ex: '@sem_spoiler' },
      { k: 'pistas', rot: 'Pistas (uma por linha, da mais difícil para a mais fácil)', tipo: 'linhas', obrig: true, min: 2 },
      { k: 'versiculo', rot: 'Referência', tipo: 'texto' }
    ],
    zoom: [
      { k: 'emoji', rot: 'Emoji do objeto', tipo: 'texto', obrig: true, curto: true },
      { k: 'objeto', rot: 'Objeto (a resposta)', tipo: 'texto', obrig: true },
      { k: 'historias', rot: 'Histórias com esse objeto (uma por linha)', tipo: 'linhas' }
    ],
    linha: [
      { k: 'titulo', rot: 'Título', tipo: 'texto', obrig: true },
      { k: 'eventos', rot: 'Acontecimentos, na ordem certa (um por linha)', tipo: 'linhas', obrig: true, min: 3 }
    ],
    lista: [
      { k: 'titulo', rot: 'O que listar', tipo: 'texto', obrig: true, ex: 'Os filhos de Jacó' },
      { k: 'itens', rot: 'Itens (um por linha)', tipo: 'linhas', obrig: true, min: 3 },
      { k: 'versiculo', rot: 'Referência', tipo: 'texto' }
    ],
    relampago: [
      { k: 'titulo', rot: 'Nome do pacote', tipo: 'texto', obrig: true },
      { k: 'itens', rot: 'Perguntas (uma por linha: pergunta = resposta)', tipo: 'linhas', obrig: true, min: 3, ex: 'Quem matou Golias? = Davi' }
    ],
    [FINAL]: [
      { k: 'tema', rot: 'Tema (aparece antes das apostas)', tipo: 'texto', obrig: true },
      { k: 'pergunta', rot: 'Pergunta', tipo: 'area', obrig: true },
      { k: 'resposta', rot: 'Resposta', tipo: 'area', obrig: true },
      { k: 'versiculo', rot: 'Referência', tipo: 'texto' }
    ]
  };

  /* texto digitado: sem < > (as telas montam HTML com ele) e sem espaços sobrando */
  const limpo = s => String(s == null ? '' : s).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
  const linhas = s => String(s || '').split(/\n+/).map(limpo).filter(Boolean);
  /* número digitado: "1.500" ou "1.500,5" (milhar com ponto) ou "2.5" (decimal com ponto) */
  const numero = v => {
    let t = String(v == null ? '' : v).trim().replace(/\s/g, '');
    if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
    return t === '' ? NaN : Number(t);
  };
  const normalizar = s => limpo(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

  /* transforma o que foi digitado no formato que o jogo usa */
  function montar(id, d) {
    const q = {};
    (FORMULARIOS[id] || []).forEach(f => {
      const v = d[f.k];
      if (f.tipo === 'vf') q[f.k] = v === true || v === 'true';
      else if (f.tipo === 'numero') q[f.k] = numero(v);
      else if (f.tipo === 'opcoes') q[f.k] = (v || []).map(limpo);
      else if (f.tipo === 'linhas') q[f.k] = Array.isArray(v) ? v.map(limpo).filter(Boolean) : linhas(v);
      else q[f.k] = limpo(v);
    });
    if (id === 'linha') q.eventos = q.eventos.map(t => ({ emoji: '📌', texto: t, ref: '' }));
    if (id === 'lista') { q.pontos = q.itens.length > 15 ? 5 : 10; q.itens = q.itens.map(n => ({ nome: n, alias: [normalizar(n)] })); }
    if (id === 'relampago') q.itens = q.itens.map(l => { const [p, ...r] = l.split('='); return [limpo(p), limpo(r.join('=')) || '—']; });
    if (id === 'zoom') q.origem = '50% 50%';
    if (id === 'perfil') { q.avatar = q.avatar || '🙂'; q.usuario = q.usuario || '@' + normalizar(q.nome).replace(/ /g, '_'); }
    if (id === 'numeros') q.emoji = q.emoji || '🔢';
    if (id === 'cardapio') q.emoji = q.emoji || '🍽️';
    return q;
  }
  /* o caminho de volta: pergunta salva → campos do formulário (para editar) */
  function campos(id, q) {
    const d = {};
    (FORMULARIOS[id] || []).forEach(f => {
      let v = q[f.k];
      if (id === 'linha' && f.k === 'eventos') v = v.map(e => e.texto);
      if (id === 'lista' && f.k === 'itens') v = v.map(i => i.nome);
      if (id === 'relampago' && f.k === 'itens') v = v.map(([p, r]) => `${p} = ${r}`);
      if (f.tipo === 'linhas') v = (v || []).join('\n');
      if (f.tipo === 'vf') v = String(!!v);
      d[f.k] = v == null ? '' : v;
    });
    return d;
  }
  /* confere o que falta; devolve a mensagem do primeiro problema (ou '') */
  function validar(id, d) {
    for (const f of FORMULARIOS[id] || []) {
      const v = d[f.k];
      if (f.tipo === 'opcoes') {
        if (f.obrig && (v || []).filter(x => limpo(x)).length < f.n) return `Preencha as ${f.n} opções de “${f.rot}”.`;
      } else if (f.tipo === 'linhas') {
        const n = linhas(v).length;
        if (f.obrig && n < (f.min || 1)) return `“${f.rot}”: escreva pelo menos ${f.min || 1}, um por linha.`;
        if (id === 'relampago' && linhas(v).some(l => !l.includes('='))) return 'No Relâmpago, cada linha precisa de “pergunta = resposta”.';
      } else if (f.tipo === 'numero') {
        if (f.obrig && !isFinite(numero(v))) return `“${f.rot}” precisa ser um número.`;
      } else if (f.obrig && !limpo(v)) return `Preencha “${f.rot}”.`;
    }
    return '';
  }

  /* ------------------------------------------------ guardar e aplicar */
  const vazio = () => ({ versao: 1, desligadas: {}, novas: {} });
  function ler() {
    try {
      const d = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (d && typeof d === 'object') return Object.assign(vazio(), d);
    } catch (e) { /* armazenamento indisponível */ }
    return vazio();
  }
  let B = ler();
  function gravar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(B)); } catch (e) { /* ignora */ }
    aplicar();
  }
  /* chave de cada pergunta: a posição (originais) ou o id (novas) */
  const chaveDe = (q, i) => q._nova || String(i);

  function aplicar() {
    Object.keys(ORIGINAIS).forEach(id => {
      const arr = lista(id);
      arr.length = ORIGINAIS[id];          /* tira as novas da aplicação anterior */
      ((B.novas[id] || [])).forEach(n => {
        if (!FORMULARIOS[id]) return;
        try { arr.push(Object.assign(montar(id, n.dados), { _nova: n.id })); } catch (e) { /* pergunta com defeito: ignora */ }
      });
      const off = new Set(B.desligadas[id] || []);
      arr.forEach((q, i) => { if (off.has(chaveDe(q, i))) q._off = true; else delete q._off; });
    });
  }

  function desligar(id, chave, sim) {
    const s = new Set(B.desligadas[id] || []);
    if (sim) s.add(chave); else s.delete(chave);
    B.desligadas[id] = [...s];
    if (!B.desligadas[id].length) delete B.desligadas[id];
    gravar();
  }
  function salvarNova(id, dados, idExistente) {
    B.novas[id] = B.novas[id] || [];
    if (idExistente) {
      const n = B.novas[id].find(x => x.id === idExistente);
      if (n) n.dados = dados;
    } else {
      B.novas[id].push({ id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), dados });
    }
    gravar();
  }
  function apagarNova(id, idNova) {
    B.novas[id] = (B.novas[id] || []).filter(x => x.id !== idNova);
    if (!B.novas[id].length) delete B.novas[id];
    const off = B.desligadas[id];
    if (off) B.desligadas[id] = off.filter(c => c !== idNova);
    gravar();
  }
  function dadosNova(id, idNova) {
    const n = (B.novas[id] || []).find(x => x.id === idNova);
    return n ? n.dados : null;
  }
  function restaurar() { B = vazio(); gravar(); }
  const contagem = () => ({
    desligadas: Object.values(B.desligadas).reduce((a, l) => a + l.length, 0),
    novas: Object.values(B.novas).reduce((a, l) => a + l.length, 0)
  });

  /* arquivo para guardar ou levar para outro computador */
  function exportar() {
    return JSON.stringify({ quiz: 'quiz-ebd-perguntas', versao: 1, salvoEm: new Date().toISOString(), desligadas: B.desligadas, novas: B.novas }, null, 2);
  }
  function importar(texto) {
    const d = JSON.parse(texto);
    if (!d || d.quiz !== 'quiz-ebd-perguntas') throw new Error('Este arquivo não é de perguntas do Quiz Bíblico.');
    const novo = vazio();
    Object.entries(d.desligadas || {}).forEach(([id, l]) => {
      if (ORIGINAIS[id] != null && Array.isArray(l)) novo.desligadas[id] = l.map(String);
    });
    Object.entries(d.novas || {}).forEach(([id, l]) => {
      if (!FORMULARIOS[id] || !Array.isArray(l)) return;
      novo.novas[id] = l.filter(n => n && typeof n.id === 'string' && n.dados && !validar(id, n.dados))
        .map(n => ({ id: n.id.slice(0, 40), dados: n.dados }));
    });
    B = novo;
    gravar();
    return contagem();
  }

  aplicar();

  window.Banco = {
    FINAL, FORMULARIOS, ORIGINAIS,
    lista, chaveDe, aplicar, desligar, salvarNova, apagarNova, dadosNova,
    campos, validar, restaurar, contagem, exportar, importar,
    podeCriar: id => !!FORMULARIOS[id],
    ativas: id => lista(id).filter(q => !q._off).length
  };
})();
