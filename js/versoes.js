/* Versões da Bíblia. O jogo foi escrito na NTLH (o padrão, em js/dados.js); aqui ficam
   só as diferenças das outras traduções:
   - as citações em que o jogo é a própria frase (Versículo Embaralhado e Quem Disse?),
     copiadas palavra por palavra de cada tradução;
   - respostas que mudam com a tradução (Mt 18:22 e os nomes do fruto do Espírito);
   - nas explicações e curiosidades, as citações da NTLH viram paráfrases sem aspas
     (PARAFRASES), que valem para qualquer tradução.
   Cada chave é "jogo:número da pergunta.campo" (a contagem começa em 0). */
(function () {
  'use strict';

  const VERSOES = [
    { id: 'ntlh', sigla: 'NTLH', nome: 'Nova Tradução na Linguagem de Hoje', credito: 'Nova Tradução na Linguagem de Hoje (NTLH) © 2000 Sociedade Bíblica do Brasil' },
    { id: 'arc', sigla: 'ARC', nome: 'Almeida Revista e Corrigida', credito: 'Almeida Revista e Corrigida (ARC) © 2009 Sociedade Bíblica do Brasil' },
    { id: 'ara', sigla: 'ARA', nome: 'Almeida Revista e Atualizada', credito: 'Almeida Revista e Atualizada (ARA) © 1993 Sociedade Bíblica do Brasil' },
    { id: 'naa', sigla: 'NAA', nome: 'Nova Almeida Atualizada', credito: 'Nova Almeida Atualizada (NAA) © 2017 Sociedade Bíblica do Brasil' },
    { id: 'nvi', sigla: 'NVI', nome: 'Nova Versão Internacional', credito: 'Nova Versão Internacional (NVI) © 2000, 2011 Biblica, Inc.' }
  ];

  /* Mt 18:22: na NTLH são 77 vezes; nas outras, "setenta vezes sete" (490) */
  const perdao = frase => ({
    'numeros:11.resposta': 490,
    'numeros:11.curiosidade': `“${frase}” Setenta vezes sete são 490. Ou seja: sempre!`
  });

  const TEXTOS = {
    arc: Object.assign({
      'versiculo:0.texto': 'O Senhor é o meu pastor; nada me faltará.',
      'versiculo:1.texto': 'No princípio, criou Deus os céus e a terra.',
      'versiculo:2.texto': 'Posso todas as coisas naquele que me fortalece.',
      'versiculo:3.texto': 'Lâmpada para os meus pés é tua palavra e luz, para o meu caminho.',
      'versiculo:4.texto': 'Eu sou o caminho, e a verdade, e a vida.',
      'versiculo:5.texto': 'Regozijai-vos, sempre, no Senhor; outra vez digo: regozijai-vos.',
      'versiculo:6.texto': 'Buscai primeiro o Reino de Deus, e a sua justiça.',
      'versiculo:7.texto': 'Instrui o menino no caminho em que deve andar.',
      'versiculo:8.texto': 'O amor é sofredor, é benigno; o amor não é invejoso.',
      'versiculo:9.texto': 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.',
      'quemdisse:0.frase': 'Sou eu guardador do meu irmão?',
      'quemdisse:1.frase': 'Eis aqui a serva do Senhor; cumpra-se em mim segundo a tua palavra.',
      'quemdisse:2.frase': 'Eis-me aqui, envia-me a mim.',
      'quemdisse:3.frase': 'Eu e a minha casa serviremos ao Senhor.',
      'quemdisse:4.frase': 'E, perecendo, pereço.',
      'quemdisse:5.frase': 'Não tenho prata nem ouro, mas o que tenho, isso te dou.',
      'quemdisse:6.frase': 'Combati o bom combate, acabei a carreira, guardei a fé.',
      'quemdisse:7.frase': 'Que é a verdade?',
      'quemdisse:8.frase': 'Senhor meu, e Deus meu!',
      'quemdisse:9.frase': 'É necessário que ele cresça e que eu diminua.',
      'quemdisse:10.frase': 'O Senhor o deu e o Senhor o tomou; bendito seja o nome do Senhor.',
      'quemdisse:11.frase': 'Fala, porque o teu servo ouve.',
      'quemdisse:12.frase': 'Tu vens a mim com espada, e com lança, e com escudo; porém eu vou a ti em nome do Senhor dos Exércitos…',
      'quemdisse:13.frase': 'Senhor, lembra-te de mim, quando entrares no teu Reino.',
      'quemdisse:14.frase': 'Como pode um homem nascer, sendo velho?',
      'quemdisse:15.frase': 'Esta é agora osso dos meus ossos e carne da minha carne.',
      'quemdisse:16.frase': 'Aonde quer que tu fores, irei eu e, onde quer que pousares à noite, ali pousarei eu.',
      'lista:2.itens': ['Amor', 'Gozo', 'Paz', 'Longanimidade', 'Benignidade', 'Bondade', 'Fé', 'Mansidão', 'Temperança']
    }, perdao('Não te digo que até sete, mas até setenta vezes sete.')),

    ara: Object.assign({
      'versiculo:0.texto': 'O Senhor é o meu pastor; nada me faltará.',
      'versiculo:1.texto': 'No princípio, criou Deus os céus e a terra.',
      'versiculo:2.texto': 'Tudo posso naquele que me fortalece.',
      'versiculo:3.texto': 'Lâmpada para os meus pés é a tua palavra e, luz para os meus caminhos.',
      'versiculo:4.texto': 'Eu sou o caminho, e a verdade, e a vida.',
      'versiculo:5.texto': 'Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos.',
      'versiculo:6.texto': 'Buscai, pois, em primeiro lugar, o seu reino e a sua justiça.',
      'versiculo:7.texto': 'Ensina a criança no caminho em que deve andar.',
      'versiculo:8.texto': 'O amor é paciente, é benigno; o amor não arde em ciúmes.',
      'versiculo:9.texto': 'Porque Deus amou ao mundo de tal maneira que deu o seu Filho unigênito.',
      'quemdisse:0.frase': 'Acaso, sou eu tutor de meu irmão?',
      'quemdisse:1.frase': 'Aqui está a serva do Senhor; que se cumpra em mim conforme a tua palavra.',
      'quemdisse:2.frase': 'Eis-me aqui, envia-me a mim.',
      'quemdisse:3.frase': 'Eu e a minha casa serviremos ao Senhor.',
      'quemdisse:4.frase': 'Se perecer, pereci.',
      'quemdisse:5.frase': 'Não possuo nem prata nem ouro, mas o que tenho, isso te dou.',
      'quemdisse:6.frase': 'Combati o bom combate, completei a carreira, guardei a fé.',
      'quemdisse:7.frase': 'Que é a verdade?',
      'quemdisse:8.frase': 'Senhor meu e Deus meu!',
      'quemdisse:9.frase': 'Convém que ele cresça e que eu diminua.',
      'quemdisse:10.frase': 'O Senhor o deu e o Senhor o tomou; bendito seja o nome do Senhor!',
      'quemdisse:11.frase': 'Fala, porque o teu servo ouve.',
      'quemdisse:12.frase': 'Tu vens contra mim com espada, e com lança, e com escudo; eu, porém, vou contra ti em nome do Senhor dos Exércitos…',
      'quemdisse:13.frase': 'Jesus, lembra-te de mim quando vieres no teu reino.',
      'quemdisse:14.frase': 'Como pode um homem nascer, sendo velho?',
      'quemdisse:15.frase': 'Esta, afinal, é osso dos meus ossos e carne da minha carne.',
      'quemdisse:16.frase': 'Aonde quer que fores, irei eu e, onde quer que pousares, ali pousarei eu.',
      'lista:2.itens': ['Amor', 'Alegria', 'Paz', 'Longanimidade', 'Benignidade', 'Bondade', 'Fidelidade', 'Mansidão', 'Domínio próprio']
    }, perdao('Não te digo que até sete vezes, mas até setenta vezes sete.')),

    naa: Object.assign({
      'versiculo:0.texto': 'O Senhor é o meu pastor; nada me faltará.',
      'versiculo:1.texto': 'No princípio, Deus criou os céus e a terra.',
      'versiculo:2.texto': 'Tudo posso naquele que me fortalece.',
      'versiculo:3.texto': 'Lâmpada para os meus pés é a tua palavra; ela é luz para os meus caminhos.',
      'versiculo:4.texto': 'Eu sou o caminho, a verdade e a vida.',
      'versiculo:5.texto': 'Alegrem-se sempre no Senhor; outra vez digo: alegrem-se!',
      'versiculo:6.texto': 'Busquem em primeiro lugar o Reino de Deus e a sua justiça.',
      'versiculo:7.texto': 'Ensine a criança no caminho em que deve andar.',
      'versiculo:8.texto': 'O amor é paciente e bondoso. O amor não arde em ciúmes.',
      'versiculo:9.texto': 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.',
      'quemdisse:0.frase': 'Por acaso sou o guardador do meu irmão?',
      'quemdisse:1.frase': 'Aqui está a serva do Senhor; que aconteça comigo conforme a sua palavra.',
      'quemdisse:2.frase': 'Eis-me aqui, envia-me a mim.',
      'quemdisse:3.frase': 'Eu e a minha casa serviremos o Senhor.',
      'quemdisse:4.frase': 'Se eu tiver de morrer, morrerei.',
      'quemdisse:5.frase': 'Não possuo nem prata nem ouro, mas o que tenho, isso lhe dou.',
      'quemdisse:6.frase': 'Combati o bom combate, completei a carreira, guardei a fé.',
      'quemdisse:7.frase': 'O que é a verdade?',
      'quemdisse:8.frase': 'Senhor meu e Deus meu!',
      'quemdisse:9.frase': 'Convém que ele cresça e que eu diminua.',
      'quemdisse:10.frase': 'O Senhor o deu e o Senhor o tomou; bendito seja o nome do Senhor!',
      'quemdisse:11.frase': 'Fala, porque o teu servo ouve.',
      'quemdisse:12.frase': 'Você vem contra mim com espada, com lança e com escudo. Eu, porém, vou contra você em nome do Senhor dos Exércitos…',
      'quemdisse:13.frase': 'Jesus, lembre-se de mim quando você vier no seu Reino.',
      'quemdisse:14.frase': 'Como pode um homem nascer, sendo velho?',
      'quemdisse:15.frase': 'Esta, afinal, é osso dos meus ossos e carne da minha carne.',
      'quemdisse:16.frase': 'Aonde quer que você for, irei eu; e onde quer que pousar, ali pousarei eu.',
      'lista:2.itens': ['Amor', 'Alegria', 'Paz', 'Longanimidade', 'Benignidade', 'Bondade', 'Fidelidade', 'Mansidão', 'Domínio próprio']
    }, perdao('Não digo a você que perdoe até sete vezes, mas até setenta vezes sete.')),

    nvi: Object.assign({
      'versiculo:0.texto': 'O Senhor é o meu pastor; de nada terei falta.',
      'versiculo:1.texto': 'No princípio, Deus criou os céus e a terra.',
      'versiculo:2.texto': 'Tudo posso naquele que me fortalece.',
      'versiculo:3.texto': 'A tua palavra é lâmpada para os meus pés e luz para o meu caminho.',
      'versiculo:4.texto': 'Eu sou o caminho, a verdade e a vida.',
      'versiculo:5.texto': 'Alegrem-se sempre no Senhor. Direi novamente: Alegrem-se!',
      'versiculo:6.texto': 'Busquem, pois, em primeiro lugar o reino de Deus e a sua justiça.',
      'versiculo:7.texto': 'Instrua a criança no caminho em que deve andar.',
      'versiculo:8.texto': 'O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.',
      'versiculo:9.texto': 'Porque Deus tanto amou o mundo que deu o seu Filho Unigênito.',
      'quemdisse:0.frase': 'Sou eu quem deve guardar o meu irmão?',
      'quemdisse:1.frase': 'Sou serva do Senhor; que aconteça comigo conforme a tua palavra.',
      'quemdisse:2.frase': 'Aqui estou. Envia-me!',
      'quemdisse:3.frase': 'Eu, porém, e a minha família serviremos ao Senhor.',
      'quemdisse:4.frase': 'Se eu tiver que morrer, morrerei.',
      'quemdisse:5.frase': 'Não tenho prata nem ouro, mas o que tenho dou a você.',
      'quemdisse:6.frase': 'Combati o bom combate, terminei a corrida, guardei a fé.',
      'quemdisse:7.frase': 'O que é a verdade?',
      'quemdisse:8.frase': 'Senhor meu e Deus meu!',
      'quemdisse:9.frase': 'É necessário que ele cresça e que eu diminua.',
      'quemdisse:10.frase': 'O Senhor o deu, o Senhor o levou; louvado seja o nome do Senhor.',
      'quemdisse:11.frase': 'Fala, pois o teu servo ouve.',
      'quemdisse:12.frase': 'Você vem contra mim com espada, com lança e com dardos, mas eu vou contra você em nome do Senhor dos Exércitos…',
      'quemdisse:13.frase': 'Jesus, lembra-te de mim quando entrares no teu reino.',
      'quemdisse:14.frase': 'Como alguém pode nascer quando já é velho?',
      'quemdisse:15.frase': 'Esta, por fim, é osso dos meus ossos e carne da minha carne!',
      'quemdisse:16.frase': 'Aonde fores, irei; onde repousares, ali repousarei!',
      'lista:2.itens': ['Amor', 'Alegria', 'Paz', 'Paciência', 'Amabilidade', 'Bondade', 'Fidelidade', 'Mansidão', 'Domínio próprio']
    }, perdao('Eu digo a você que não até sete, mas até setenta vezes sete.'))
  };

  /* explicações e curiosidades: sem citar a NTLH ao pé da letra (valem para as outras versões) */
  const PARAFRASES = {
    'cambio:0.conta': 'Mais de 300 denários',
    'cambio:2.pergunta': 'Uma viúva pobre pôs no templo duas moedinhas de pouco valor (no original, duas leptas). Quanto valeria a oferta dela hoje?',
    'cambio:3.conta': '2 denários',
    'cambio:3.curiosidade': 'E ainda prometeu pagar, quando voltasse, o que o dono da hospedaria gastasse a mais com o ferido.',
    'cambio:4.conta': 'Mais de 200 denários',
    'cambio:5.pergunta': 'Na parábola, um empregado devia ao rei 10 mil talentos e foi perdoado. Quanto valeria essa dívida hoje?',
    'cambio:6.pergunta': 'Jesus disse que dois passarinhos eram vendidos por uma moedinha (no original, um asse). Quanto custariam hoje?',
    'cambio:6.curiosidade': 'Nenhum deles cai no chão sem o Pai saber. Por isso Jesus disse para não termos medo: valemos mais do que muitos passarinhos.',
    'cambio:7.pergunta': 'Pedro pescou um peixe com uma moeda na boca (no original, um estáter), para pagar o imposto do templo. Quanto valia?',
    'cambio:8.pergunta': 'Na parábola, o primeiro empregado recebeu 5 talentos. Quanto seria isso hoje?',
    'maisoumenos:2.bib': 'A dívida perdoada do empregado da parábola',
    'numeros:12.curiosidade': 'Sete anos que lhe pareceram poucos dias, pelo amor que tinha a ela, e mais sete depois que Labão o enganou.',
    'emoji:16.dica': 'Deus mandou Moisés tirar as sandálias.',
    'zoom:4.historias.0': 'É mais fácil um camelo passar pelo fundo de uma agulha do que um rico entrar no Reino de Deus (Mt 19:24)',
    'zoom:6.historias.1': 'Jesus chama os seus seguidores de sal da terra (Mt 5:13)',
    'zoom:8.historias.1': 'A Palavra de Deus é lâmpada para os nossos pés (Sl 119:105)',
    'zoom:9.historias.1': 'Jesus é a videira, e nós somos os ramos (Jo 15:5)',
    'tanabiblia:5.explicacao': 'Deus mandou Moisés tirar as sandálias, porque o lugar onde ele estava era santo.',
    'tanabiblia:6.explicacao': 'O texto diz que o amor ao dinheiro é a raiz de todos os males. É o amor ao dinheiro, não o dinheiro em si.',
    'tanabiblia:7.explicacao': 'Ditado popular. O que a Bíblia diz é que todas as coisas cooperam para o bem daqueles que amam a Deus.',
    'tanabiblia:9.explicacao': 'Deus mandou levar sete casais de cada espécie de animal puro. Só dos impuros foi um casal.',
    'tanabiblia:10.explicacao': 'Ele pegou uma queixada de jumento e com ela venceu mil filisteus.',
    'tanabiblia:15.explicacao': 'Lucas diz que Jesus tinha mais ou menos trinta anos quando começou o seu trabalho. Os 33 são uma estimativa.',
    'tanabiblia:17.explicacao': 'Atos diz que ele caiu por terra, mas não menciona cavalo nenhum! O cavalo veio das pinturas.',
    'cardapio:5.curiosidade': 'Jesus mostrou as mãos e os pés aos discípulos, para provar que era ele mesmo.',
    'cardapio:6.curiosidade': 'O pai fez festa porque o filho que estava morto reviveu; estava perdido e foi achado.',
    'cardapio:9.curiosidade': 'Isaque estava quase cego e estranhou: a voz era de Jacó, mas as mãos pareciam as de Esaú.'
  };

  const MODULOS = {};
  window.QUIZ.modulos.forEach(m => { MODULOS[m.id] = m; });

  /* "lista:2.itens" mexe nos nomes dos itens (os apelidos aceitos já cobrem todas as versões) */
  function alvo(chave) {
    const [cab, ...resto] = chave.split('.');
    const [mod, i] = cab.split(':');
    let o = MODULOS[mod].perguntas[+i];
    for (let k = 0; k < resto.length - 1; k++) o = o[resto[k]];
    return { o, campo: resto[resto.length - 1] };
  }
  function ler(chave) {
    const { o, campo } = alvo(chave);
    return campo === 'itens' ? o.itens.map(it => it.nome) : o[campo];
  }
  function escrever(chave, v) {
    const { o, campo } = alvo(chave);
    if (campo === 'itens') o.itens.forEach((it, k) => { it.nome = v[k]; });
    else o[campo] = v;
  }

  /* guarda o texto original (NTLH) de tudo o que alguma versão muda */
  const ORIGINAL = {};
  Object.values(TEXTOS).concat([PARAFRASES]).forEach(t => Object.keys(t).forEach(c => {
    if (!(c in ORIGINAL)) ORIGINAL[c] = JSON.parse(JSON.stringify(ler(c)));
  }));

  let atual = 'ntlh';
  function aplicar(id) {
    if (!TEXTOS[id] && id !== 'ntlh') id = 'ntlh';
    const t = TEXTOS[id] || {};
    Object.keys(ORIGINAL).forEach(c => {
      const v = id === 'ntlh' ? ORIGINAL[c] : (c in t ? t[c] : (c in PARAFRASES ? PARAFRASES[c] : ORIGINAL[c]));
      escrever(c, JSON.parse(JSON.stringify(v)));
    });
    atual = id;
  }
  const info = id => VERSOES.find(v => v.id === (id || atual)) || VERSOES[0];

  window.Versoes = {
    LISTA: VERSOES,
    aplicar,
    get atual() { return atual; },
    info,
    credito: id => info(id).credito
  };
})();
