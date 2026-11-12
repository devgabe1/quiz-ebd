/* ==========================================================================
   Ilustrações do quiz (desenhadas em SVG, sem arquivos externos).
   Cada desenho segue as proporções da Bíblia (1 côvado ≈ 45 cm), porque no
   "Do Tamanho Certo" a forma e a proporção fazem parte da resposta:
     - o viewBox é justo no objeto, para a figura encostar no chão e no topo;
     - "ar" (largura ÷ altura) sai do próprio viewBox.
   ========================================================================== */
window.ARTE = (function () {
  const C = {
    tinta: '#2A1A3E',
    ouro: '#F4B731', ouroEsc: '#D4911A', ouroCla: '#FFE08A',
    madeira: '#A86B3C', madeiraEsc: '#7A4A26', madeiraCla: '#C98B52',
    bronze: '#C77B3A', bronzeEsc: '#8E5226', bronzeCla: '#E3A066',
    ferro: '#6B6F7E', ferroEsc: '#474A56',
    pedra: '#E8D9B5', pedra2: '#DCCB9F', pedra3: '#CDB98E',
    pele: '#E9B48A', peleEsc: '#C98D63',
    azul: '#2479D8', vermelho: '#D7263D', vermelhoEsc: '#8E1426', purpura: '#8E44C9',
    linho: '#FFF6E3', vidro: '#BFE3FF', grama: '#4E9F3D', gramaEsc: '#438A34'
  };

  function svg(vb, corpo) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">` +
      `<style>*{vector-effect:non-scaling-stroke}</style>` +
      `<g stroke="${C.tinta}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${corpo}</g></svg>`;
  }
  const repetir = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');

  const D = {};

  /* ---------------------------------------------------------------- pessoas */

  /* Homem adulto: 1,75 m */
  D.homem = svg('6 0 48 175', `
    <rect x="15" y="84" width="13.5" height="82" rx="3" fill="#33405E"/>
    <rect x="31.5" y="84" width="13.5" height="82" rx="3" fill="#33405E"/>
    <rect x="12" y="163" width="17" height="12" rx="5" fill="#3A2A20"/>
    <rect x="31" y="163" width="17" height="12" rx="5" fill="#3A2A20"/>
    <rect x="7" y="29" width="9.5" height="50" rx="4.75" fill="${C.azul}"/>
    <rect x="43.5" y="29" width="9.5" height="50" rx="4.75" fill="${C.azul}"/>
    <circle cx="11.75" cy="81" r="5" fill="${C.pele}"/>
    <circle cx="48.25" cy="81" r="5" fill="${C.pele}"/>
    <rect x="26" y="20" width="8" height="9" fill="${C.pele}"/>
    <path d="M14 32 Q14 27 20 27 L40 27 Q46 27 46 32 L46 88 L14 88Z" fill="#2E8AE6"/>
    <circle cx="30" cy="13" r="11" fill="${C.pele}"/>
    <path d="M19 13 Q18 0.5 30 0.5 Q42 0.5 41 13 Q37 6 30 7 Q23 6 19 13Z" fill="#4A2E1E"/>`);

  /* Golias: 6 côvados e um palmo (≈ 2,9 m), armadura de bronze e lança (1 Sm 17:4-7) */
  D.golias = svg('14 0 136 290', `
    <defs><pattern id="esc" width="12" height="10" patternUnits="userSpaceOnUse">
      <rect width="12" height="10" fill="${C.bronze}" stroke="none"/>
      <path d="M0 0 Q6 11 12 0" fill="none" stroke="${C.bronzeEsc}"/></pattern></defs>
    <rect x="133" y="28" width="6" height="260" rx="3" fill="#8A5A2E"/>
    <path d="M136 2 Q147 16 141 32 L131 32 Q125 16 136 2Z" fill="#9AA0AE"/>
    <rect x="46" y="194" width="22" height="80" rx="6" fill="${C.pele}"/>
    <rect x="82" y="194" width="22" height="80" rx="6" fill="${C.pele}"/>
    <rect x="43" y="224" width="28" height="46" rx="6" fill="${C.bronze}"/>
    <rect x="79" y="224" width="28" height="46" rx="6" fill="${C.bronze}"/>
    <rect x="38" y="270" width="34" height="20" rx="8" fill="#5A3A22"/>
    <rect x="78" y="270" width="34" height="20" rx="8" fill="#5A3A22"/>
    <path d="M30 150 L40 148 L28 202 L21 199Z" fill="#6B4423"/>
    <path d="M38 74 Q18 80 18 102 L20 160 Q22 172 32 170 Q40 168 40 158 L42 104Z" fill="${C.pele}"/>
    <path d="M112 74 Q132 80 132 102 L132 146 L114 150 L110 104Z" fill="${C.pele}"/>
    <rect x="18" y="112" width="22" height="8" rx="3" fill="${C.bronze}"/>
    <rect x="111" y="112" width="21" height="8" rx="3" fill="${C.bronze}"/>
    <path d="M34 78 Q34 66 54 64 L96 64 Q116 66 116 78 L112 152 L38 152Z" fill="url(#esc)"/>
    <rect x="36" y="146" width="78" height="11" rx="3" fill="#6B4423"/>
    <path d="M38 157 L112 157 L118 198 L32 198Z" fill="${C.vermelho}"/>
    <path d="M47 158 V197 M57 158 V197 M67 158 V197 M77 158 V197 M87 158 V197 M97 158 V197 M107 158 V197" fill="none" stroke="${C.vermelhoEsc}"/>
    <ellipse cx="38" cy="80" rx="16" ry="12" fill="${C.bronze}"/>
    <ellipse cx="112" cy="80" rx="16" ry="12" fill="${C.bronze}"/>
    <circle cx="134" cy="152" r="10" fill="${C.pele}"/>
    <rect x="64" y="56" width="22" height="14" fill="${C.pele}"/>
    <ellipse cx="75" cy="42" rx="18" ry="21" fill="${C.pele}"/>
    <path d="M58 44 Q60 70 75 72 Q90 70 92 44 Q86 56 75 56 Q64 56 58 44Z" fill="#3B2414"/>
    <circle cx="68" cy="40" r="2.2" fill="${C.tinta}" stroke="none"/>
    <circle cx="82" cy="40" r="2.2" fill="${C.tinta}" stroke="none"/>
    <path d="M55 44 Q54 12 75 12 Q96 12 95 44 L89 44 Q89 26 75 26 Q61 26 61 44Z" fill="${C.bronze}"/>
    <path d="M55 40 L61 40 L62 58 L56 54Z M95 40 L89 40 L88 58 L94 54Z" fill="${C.bronze}"/>
    <path d="M60 18 Q62 2 75 0.5 Q88 2 90 18 Q82 11 75 12 Q68 11 60 18Z" fill="${C.vermelho}"/>`);

  /* ---------------------------------------------------------------- animais */

  /* Girafa adulta inteira: 5,5 m */
  const corpoGirafa = 'M60 300 Q58 240 130 232 L250 228 Q300 230 300 290 Q300 350 240 356 L120 356 Q62 352 60 300Z';
  const pescocoGirafa = 'M240 250 L300 70 Q312 40 340 48 Q352 60 340 84 L296 272Z';
  D.girafa = svg('34 0 366 550', `
    <defs><clipPath id="g"><path d="${corpoGirafa}"/><path d="${pescocoGirafa}"/></clipPath></defs>
    <path d="M60 260 Q44 300 42 352 L48 352 Q50 304 66 266Z" fill="#E9A93A"/>
    <ellipse cx="45" cy="364" rx="8" ry="15" fill="#5A3A22"/>
    <rect x="88" y="330" width="22" height="205" rx="8" fill="#F2C14E"/>
    <rect x="122" y="335" width="22" height="200" rx="8" fill="#E9B23E"/>
    <rect x="228" y="330" width="22" height="205" rx="8" fill="#F2C14E"/>
    <rect x="262" y="335" width="22" height="200" rx="8" fill="#E9B23E"/>
    <rect x="86" y="532" width="26" height="18" rx="4" fill="#3B2414"/>
    <rect x="120" y="532" width="26" height="18" rx="4" fill="#3B2414"/>
    <rect x="226" y="532" width="26" height="18" rx="4" fill="#3B2414"/>
    <rect x="260" y="532" width="26" height="18" rx="4" fill="#3B2414"/>
    <path d="${corpoGirafa}" fill="#F2C14E"/>
    <path d="${pescocoGirafa}" fill="#F2C14E"/>
    <g clip-path="url(#g)" fill="#B8702E" stroke="none">
      <ellipse cx="100" cy="270" rx="18" ry="14"/><ellipse cx="150" cy="252" rx="16" ry="12"/>
      <ellipse cx="200" cy="262" rx="20" ry="15"/><ellipse cx="252" cy="256" rx="15" ry="12"/>
      <ellipse cx="120" cy="316" rx="20" ry="16"/><ellipse cx="176" cy="306" rx="18" ry="14"/>
      <ellipse cx="232" cy="314" rx="20" ry="15"/><ellipse cx="278" cy="298" rx="12" ry="14"/>
      <ellipse cx="270" cy="192" rx="13" ry="16"/><ellipse cx="286" cy="136" rx="11" ry="14"/>
      <ellipse cx="304" cy="92" rx="9" ry="12"/><ellipse cx="258" cy="232" rx="12" ry="10"/>
    </g>
    <path d="M236 246 L294 66 L300 70 L242 250Z" fill="#A8642A"/>
    <rect x="328" y="6" width="7" height="26" rx="3" fill="#F2C14E"/>
    <rect x="343" y="6" width="7" height="24" rx="3" fill="#F2C14E"/>
    <circle cx="331.5" cy="5" r="5" fill="#3B2414"/>
    <circle cx="346.5" cy="5.5" r="5" fill="#3B2414"/>
    <path d="M318 40 Q340 22 372 34 L394 52 Q398 66 384 70 L340 72 Q320 66 318 40Z" fill="#F2C14E"/>
    <path d="M322 44 L302 36 L318 54Z" fill="#E9A93A"/>
    <circle cx="352" cy="46" r="4" fill="${C.tinta}" stroke="none"/>
    <circle cx="388" cy="58" r="2" fill="${C.tinta}" stroke="none"/>`);

  /* ---------------------------------------------------------------- estátua */

  /* Estátua de Nabucodonosor: 60 côvados de altura e 6 de largura (Dn 3:1) */
  D.estatua = svg('0 0 60 270', `
    <rect x="0" y="252" width="60" height="18" fill="${C.pedra}"/>
    <rect x="6" y="238" width="48" height="14" fill="${C.pedra2}"/>
    <rect x="12" y="214" width="36" height="24" fill="${C.pedra3}"/>
    <rect x="47" y="14" width="3" height="96" fill="${C.ouroEsc}"/>
    <circle cx="48.5" cy="13" r="4" fill="${C.ouroCla}"/>
    <path d="M18 44 L42 44 L46 214 L14 214Z" fill="${C.ouro}"/>
    <path d="M30 52 L33 212 L27 212Z" fill="${C.ouroEsc}" stroke="none"/>
    <rect x="9" y="48" width="7" height="72" rx="3.5" fill="${C.ouro}"/>
    <rect x="43" y="48" width="7" height="62" rx="3.5" fill="${C.ouro}"/>
    <circle cx="12.5" cy="122" r="4" fill="${C.ouroCla}"/>
    <circle cx="47" cy="108" r="4" fill="${C.ouroCla}"/>
    <path d="M14 54 Q16 40 30 38 Q44 40 46 54 L44 70 L16 70Z" fill="${C.ouro}"/>
    <rect x="15" y="96" width="30" height="5" fill="${C.ouroEsc}"/>
    <circle cx="30" cy="26" r="9" fill="${C.ouro}"/>
    <path d="M22 28 Q24 42 30 42 Q36 42 38 28Z" fill="${C.ouroEsc}"/>
    <path d="M20 19 L20 4 L25 10 L30 0.5 L35 10 L40 4 L40 19Z" fill="${C.ouroCla}"/>`);

  /* ---------------------------------------------------------------- embarcações e objetos */

  /* Arca de Noé: 300 côvados × 30 de altura (Gn 6:15-16), com a abertura logo abaixo do teto */
  D['arca-noe'] = svg('0 0 1350 135', `
    <path d="M0 52 L1350 52 L1325 135 L25 135Z" fill="${C.madeira}"/>
    <path d="M6 74 H1344 M14 96 H1336 M20 116 H1330" fill="none" stroke="${C.madeiraEsc}"/>
    <rect x="30" y="31" width="1290" height="17" fill="${C.madeiraCla}"/>
    <rect x="30" y="22" width="1290" height="9" fill="#3B2414"/>
    ${repetir(22, i => `<rect x="${30 + i * 60}" y="22" width="12" height="9" fill="${C.madeiraCla}"/>`)}
    <path d="M14 23 L675 0.5 L1336 23Z" fill="${C.madeiraEsc}"/>
    <rect x="0" y="46" width="1350" height="8" fill="${C.madeiraEsc}"/>
    <rect x="820" y="62" width="62" height="52" rx="4" fill="#5A3A22"/>`);

  /* Arca da Aliança: 2,5 × 1,5 côvados, com os querubins sobre a tampa (Êx 25:10-22) */
  /* querubim ajoelhado, olhando para o centro, com as asas estendidas por cima (Êx 25:20) */
  const querubimTampa = `
    <path d="M36 66 Q8 40 26 14 Q46 0.5 86 1.5 Q112 3 124 14 Q112 15 106 21 Q100 21 94 28 Q86 28 80 35 Q72 36 66 44 Q58 46 54 56Z" fill="${C.ouroCla}"/>
    <path d="M40 46 Q50 22 82 12 M46 56 Q60 34 92 24 M30 36 Q42 14 72 6" fill="none" stroke="${C.ouroEsc}"/>
    <path d="M22 98 Q20 76 32 64 L52 58 Q68 62 72 78 L84 98Z" fill="${C.ouro}"/>
    <path d="M56 70 Q80 72 96 88 L90 94 Q74 82 54 80Z" fill="${C.ouro}"/>
    <circle cx="62" cy="50" r="12" fill="${C.ouro}"/>
    <path d="M51 46 Q54 36 64 37 Q60 42 56 52Z" fill="${C.ouroEsc}"/>
    <circle cx="68" cy="51" r="2" fill="${C.tinta}" stroke="none"/>`;
  D['arca-alianca'] = svg('0 0 250 255', `
    ${querubimTampa}
    <g transform="translate(250 0) scale(-1 1)">${querubimTampa}</g>
    <rect x="0" y="112" width="250" height="143" fill="${C.ouro}"/>
    <rect x="16" y="132" width="218" height="88" rx="4" fill="#E8A522"/>
    <path d="M30 148 H220 M30 204 H220" fill="none" stroke="${C.ouroEsc}"/>
    <rect x="0" y="112" width="250" height="10" fill="${C.ouroEsc}"/>
    <rect x="0" y="98" width="250" height="14" fill="${C.ouroCla}"/>
    <rect x="2" y="228" width="246" height="11" rx="5.5" fill="#C7861A"/>
    <circle cx="34" cy="233" r="12" fill="${C.ouroCla}"/>
    <circle cx="34" cy="233" r="5" fill="${C.ouroEsc}"/>
    <circle cx="216" cy="233" r="12" fill="${C.ouroCla}"/>
    <circle cx="216" cy="233" r="5" fill="${C.ouroEsc}"/>`);

  /* Cama (desenho único; a do rei Ogue é de ferro, Dt 3:11) */
  function cama(cor, escuro, colcha, ferro) {
    return svg('0 0 210 110', `
      <rect x="16" y="90" width="10" height="20" fill="${escuro}"/>
      <rect x="184" y="90" width="10" height="20" fill="${escuro}"/>
      <rect x="0" y="4" width="20" height="106" rx="6" fill="${cor}"/>
      <rect x="190" y="44" width="20" height="66" rx="6" fill="${cor}"/>
      ${ferro ? `<circle cx="10" cy="6" r="6" fill="${escuro}"/><circle cx="200" cy="46" r="6" fill="${escuro}"/>
        <path d="M6 24 H14 M6 40 H14 M196 62 H204 M196 78 H204" fill="none" stroke="${escuro}"/>` : ''}
      <rect x="18" y="72" width="174" height="18" fill="${cor}"/>
      ${ferro ? repetir(8, i => `<circle cx="${32 + i * 21}" cy="81" r="2.5" fill="${escuro}" stroke="none"/>`) : ''}
      <rect x="20" y="50" width="172" height="26" rx="8" fill="${C.linho}"/>
      <rect x="24" y="34" width="44" height="20" rx="10" fill="#FFFFFF"/>
      <path d="M72 44 L192 44 Q197 44 197 50 L197 80 L72 80 Q64 62 72 44Z" fill="${colcha}"/>
      <path d="M100 44 Q94 62 100 80" fill="none" stroke="rgba(0,0,0,0.25)"/>`);
  }
  D['cama-ogue'] = cama(C.ferro, C.ferroEsc, C.purpura, true);
  D['cama-king'] = cama(C.madeira, C.madeiraEsc, C.azul, false);

  /* Violão: ≈ 1 m */
  D.violao = svg('0 0 300 110', `
    <rect x="168" y="46" width="104" height="18" fill="#6B4423"/>
    <path d="M180 46 V64 M192 46 V64 M204 46 V64 M216 46 V64 M228 46 V64 M240 46 V64 M252 46 V64 M264 46 V64" fill="none" stroke="#C9B48A"/>
    <path d="M270 40 L298 35 Q301 55 298 75 L270 70Z" fill="#5A3A22"/>
    <circle cx="280" cy="33" r="4" fill="#C9B48A"/><circle cx="292" cy="31" r="4" fill="#C9B48A"/>
    <circle cx="280" cy="77" r="4" fill="#C9B48A"/><circle cx="292" cy="79" r="4" fill="#C9B48A"/>
    <path d="M54 2 Q90 2 104 22 Q114 30 132 15 Q172 15 172 55 Q172 95 132 95 Q114 80 104 88 Q90 108 54 108 Q1 108 1 55 Q1 2 54 2Z" fill="#D9893F"/>
    <circle cx="112" cy="55" r="19" fill="none" stroke="#7A4A26"/>
    <circle cx="112" cy="55" r="15" fill="#3B2414"/>
    <rect x="42" y="42" width="11" height="26" rx="2" fill="#5A3A22"/>
    <path d="M50 49 H286 M50 55 H286 M50 61 H286" fill="none" stroke="${C.linho}" stroke-width="1"/>`);

  /* ---------------------------------------------------------------- templo */

  /* Templo de Salomão (lateral): 60 côvados × 30 de altura, com Jaquim e Boaz na frente (1 Rs 6:2-6) */
  D.templo = svg('0 0 600 300', `
    <rect x="0" y="14" width="600" height="286" fill="${C.pedra}"/>
    ${repetir(8, i => `<rect x="${40 + i * 56}" y="40" width="18" height="52" rx="2" fill="#5A3A22"/>
      <path d="M${49 + i * 56} 40 V92 M${40 + i * 56} 66 H${58 + i * 56}" fill="none" stroke="${C.pedra3}"/>`)}
    <rect x="0" y="128" width="496" height="172" fill="${C.pedra2}"/>
    <path d="M0 186 H496 M0 243 H496" fill="none" stroke="${C.pedra3}"/>
    ${[146, 203, 260].map(y => repetir(9, i => `<rect x="${26 + i * 52}" y="${y}" width="14" height="20" rx="2" fill="#5A3A22"/>`)).join('')}
    <rect x="496" y="14" width="104" height="286" fill="#EFE3C4"/>
    <rect x="528" y="196" width="44" height="98" fill="${C.ouro}"/>
    <path d="M550 196 V294" fill="none"/>
    <rect x="0" y="0.5" width="600" height="16" fill="${C.pedra3}"/>
    <rect x="0" y="16" width="600" height="5" fill="${C.ouro}"/>
    <rect x="496" y="290" width="104" height="10" fill="${C.pedra3}"/>
    <rect x="506" y="110" width="16" height="182" fill="${C.bronze}"/>
    <rect x="500" y="92" width="28" height="22" rx="7" fill="${C.bronzeCla}"/>
    <rect x="578" y="110" width="16" height="182" fill="${C.bronze}"/>
    <rect x="572" y="92" width="28" height="22" rx="7" fill="${C.bronzeCla}"/>`);

  /* Pátio do Tabernáculo (lateral): 100 côvados de cortinas de linho com 5 de altura,
     postes de bronze com capitéis de prata e a tenda ao fundo (Êx 27:9-18; 26:14) */
  D.atrio = svg('0 0 1000 100', `
    <path d="M560 52 L560 16 Q560 6 572 6 L888 6 Q900 6 900 16 L900 52Z" fill="${C.vermelhoEsc}"/>
    <path d="M560 22 H900" fill="none" stroke="#5E0C1A"/>
    <path d="M300 50 C290 36 310 28 300 16 C292 8 304 2 300 0.5 C316 6 308 16 316 26 C324 38 308 44 312 50Z" fill="rgba(160,150,180,0.55)" stroke="none"/>
    <path d="M318 50 C312 40 326 34 320 24 C334 30 328 40 330 50Z" fill="rgba(160,150,180,0.4)" stroke="none"/>
    <rect x="0" y="46" width="1000" height="50" fill="${C.linho}"/>
    ${repetir(20, i => `<path d="M${i * 50 + 25} 48 V94" fill="none" stroke="#E6D8B8"/>`)}
    ${repetir(21, i => { const x = Math.min(994, Math.max(0, i * 50 - 3)); return `<rect x="${x}" y="44" width="6" height="56" fill="${C.bronze}"/><rect x="${x - 1}" y="40" width="8" height="6" fill="#C9CCD6"/>`; })}`);

  /* Nova Jerusalém: cubo de 12.000 estádios (≈ 2.200 km) de largura, comprimento e altura,
     muro de jaspe, portas de pérola e alicerces de pedras preciosas (Ap 21:10-21).
     Vista de frente: a largura do desenho é a largura da cidade; as torres ficam por cima. */
  const pedrasAlicerce = ['#7FD1C2', '#2479D8', '#9AB2C8', '#3DBE7A', '#D7263D', '#E0533A',
    '#F4D35E', '#5EC2B7', '#F4B731', '#8FD694', '#F07F2E', '#8E44C9'];
  D['nova-jerusalem'] = svg('0 0 400 440', `
    ${[30, 185, 340].map(x => `<rect x="${x}" y="8" width="30" height="40" fill="${C.ouro}"/><path d="M${x - 4} 10 L${x + 15} 0.5 L${x + 34} 10Z" fill="${C.ouroCla}"/>`).join('')}
    ${repetir(12, i => `<rect x="${i * 34}" y="28" width="22" height="18" fill="${C.ouro}"/>`)}
    <rect x="0" y="40" width="400" height="400" fill="${C.ouro}"/>
    ${repetir(6, l => repetir(10, c => `<rect x="${18 + c * 38}" y="${62 + l * 36}" width="22" height="20" rx="3" fill="#FFF1B8" stroke="${C.ouroEsc}"/>`))}
    <rect x="0" y="292" width="400" height="112" fill="#7FD1C2"/>
    ${repetir(8, i => `<path d="M${i * 50} 292 V404" fill="none" stroke="#5EB5A6"/>`)}
    ${[50, 170, 290].map(x => `<path d="M${x} 404 L${x} 340 Q${x + 30} 300 ${x + 60} 340 L${x + 60} 404Z" fill="#F5F0FF"/><ellipse cx="${x + 22}" cy="350" rx="8" ry="12" fill="#FFFFFF" stroke="none"/>`).join('')}
    ${pedrasAlicerce.map((cor, i) => `<rect x="0" y="${404 + i * 3}" width="400" height="3" fill="${cor}" stroke="none"/>`).join('')}
    <path d="M0 404 H400 M0 440 H400" fill="none"/>`);

  /* Rolo voador da visão de Zacarias: 20 × 10 côvados (≈ 9 × 4,5 m) (Zc 5:1-2) */
  D['rolo-voador'] = svg('0 0 400 200', `
    <path d="M70 16 H150 M100 6 H190 M230 12 H330 M60 192 H170 M250 188 H340" fill="none" stroke="#9A8FB6" stroke-width="4"/>
    <rect x="18" y="28" width="364" height="144" fill="#F1DEB3"/>
    ${repetir(6, i => `<path d="M56 ${52 + i * 20} H${344 - (i % 3) * 40}" fill="none" stroke="#8A6630" stroke-width="5"/>`)}
    <rect x="0" y="14" width="26" height="172" rx="11" fill="${C.madeiraEsc}"/>
    <rect x="374" y="14" width="26" height="172" rx="11" fill="${C.madeiraEsc}"/>
    <circle cx="13" cy="10" r="9.5" fill="${C.madeira}"/><circle cx="13" cy="190" r="9.5" fill="${C.madeira}"/>
    <circle cx="387" cy="10" r="9.5" fill="${C.madeira}"/><circle cx="387" cy="190" r="9.5" fill="${C.madeira}"/>`);

  /* Forca de Hamã: 50 côvados de altura (≈ 22,5 m) (Et 5:14). Só a estrutura de madeira. */
  D.forca = svg('0 0 160 450', `
    <path d="M70 420 L96 356 L96 420Z M146 420 L120 356 L120 420Z" fill="${C.madeiraEsc}"/>
    <rect x="96" y="12" width="24" height="410" fill="${C.madeira}"/>
    <path d="M104 30 V410 M112 60 V380" fill="none" stroke="${C.madeiraEsc}"/>
    <path d="M96 98 L42 22 L60 22 L104 84Z" fill="${C.madeiraEsc}"/>
    <rect x="6" y="0.5" width="148" height="22" fill="${C.madeiraCla}"/>
    <path d="M30 0.5 V22 M130 0.5 V22" fill="none" stroke="${C.madeiraEsc}"/>
    <rect x="0" y="418" width="160" height="32" fill="${C.madeiraEsc}"/>
    <path d="M0 434 H160" fill="none" stroke="#5A3A22"/>`);

  /* ---------------------------------------------------------------- referências de hoje */

  /* A Lua: 3.475 km de diâmetro */
  D.lua = svg('0 0 400 400', `
    <circle cx="200" cy="200" r="199" fill="#D9DAE3"/>
    <path d="M260 22 A199 199 0 0 1 260 378 A230 230 0 0 0 260 22Z" fill="#C4C6D2" stroke="none"/>
    ${[[130, 120, 34], [250, 90, 20], [90, 240, 24], [210, 230, 46], [300, 280, 22], [150, 320, 18], [310, 170, 14], [70, 160, 12]].map(([x, y, r]) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="#BFC1CD"/><circle cx="${x - r * 0.25}" cy="${y - r * 0.25}" r="${r * 0.55}" fill="#B1B3C1" stroke="none"/>`).join('')}`);

  /* Campo de futebol (105 m), visto um pouco de cima */
  D.campo = svg('0 0 1050 170', `
    <path d="M95 42 L955 42 L1050 170 L0 170Z" fill="${C.grama}"/>
    ${repetir(10, i => i % 2 ? '' : `<path d="M${95 + i * 86} 42 L${181 + i * 86} 42 L${(i + 1) * 105} 170 L${i * 105} 170Z" fill="${C.gramaEsc}" stroke="none"/>`)}
    <path d="M95 42 L955 42 L1050 170 L0 170Z M525 42 V170" fill="none" stroke="#fff" stroke-width="2"/>
    <ellipse cx="525" cy="104" rx="70" ry="20" fill="none" stroke="#fff" stroke-width="2"/>
    <path d="M55 66 L40 86 V116 L55 96Z" fill="rgba(255,255,255,0.35)" stroke="none"/>
    <path d="M55 96 V66 L40 86 V116" fill="none" stroke="#fff" stroke-width="3"/>
    <path d="M995 66 L1010 86 V116 L995 96Z" fill="rgba(255,255,255,0.35)" stroke="none"/>
    <path d="M995 96 V66 L1010 86 V116" fill="none" stroke="#fff" stroke-width="3"/>
    <path d="M95 42 V2 M955 42 V2" fill="none"/>
    <path d="M95 0.5 L114 7 L95 13Z M955 0.5 L974 7 L955 13Z" fill="${C.vermelho}"/>`);

  /* Ônibus: 12 m */
  D.onibus = svg('0 0 1200 320', `
    <rect x="0" y="0.5" width="1200" height="272" rx="34" fill="${C.ouro}"/>
    <path d="M0 190 H1200 V238 Q1200 272 1166 272 H34 Q0 272 0 238Z" fill="${C.azul}"/>
    <path d="M18 44 Q20 24 42 24 L118 24 L118 160 L18 160Z" fill="${C.vidro}"/>
    <rect x="130" y="28" width="72" height="234" rx="6" fill="#8FCBF2"/>
    <path d="M166 28 V262" fill="none"/>
    ${repetir(8, i => `<rect x="${220 + i * 118}" y="34" width="104" height="112" rx="10" fill="${C.vidro}"/>`)}
    <rect x="1170" y="40" width="22" height="70" rx="6" fill="${C.vermelho}"/>
    <circle cx="330" cy="270" r="48" fill="${C.tinta}"/><circle cx="330" cy="270" r="20" fill="#B9BCC6"/>
    <circle cx="1000" cy="270" r="48" fill="${C.tinta}"/><circle cx="1000" cy="270" r="20" fill="#B9BCC6"/>`);

  /* ==================================================================== ZOOM BÍBLICO
     Estes entram direto na página (SVG em linha) para continuarem nítidos com o
     zoom de 11×. Por isso não têm <style> nem ids: não podem afetar o resto da página. */
  function svgZ(corpo) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">` +
      `<g stroke="${C.tinta}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${corpo}</g></svg>`;
  }
  /* formas com contorno único (desenha a sombra grossa e depois a cor por cima) */
  function contorno(formas, cor) {
    return `<g fill="${C.tinta}" stroke="${C.tinta}" stroke-width="7">${formas}</g><g fill="${cor}" stroke="none">${formas}</g>`;
  }
  function nuvem(x, y, k) {
    k = k || 1;
    const f = `<circle cx="${x - 28 * k}" cy="${y}" r="${22 * k}"/><circle cx="${x}" cy="${y - 14 * k}" r="${30 * k}"/>
      <circle cx="${x + 30 * k}" cy="${y}" r="${22 * k}"/><rect x="${x - 50 * k}" y="${y}" width="${100 * k}" height="${22 * k}" rx="${11 * k}"/>`;
    return contorno(f, '#FFFFFF');
  }
  /* traço grosso com contorno (corpo de cobra, degraus, alças) */
  function traco(d, cor, larg) {
    return `<path d="${d}" fill="none" stroke="${C.tinta}" stroke-width="${larg + 7}"/>` +
      `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${larg}"/>`;
  }

  /* Galo (a negação de Pedro) */
  D['z-galo'] = svgZ(`
    <path d="M190 150 Q260 60 282 122 Q252 110 236 150Z" fill="#2E5E3A"/>
    <path d="M190 162 Q276 104 290 172 Q256 152 230 176Z" fill="#1F3F2A"/>
    <path d="M186 172 Q262 162 272 216 Q242 192 214 196Z" fill="${C.vermelhoEsc}"/>
    <rect x="136" y="216" width="9" height="52" rx="3" fill="${C.ouro}"/>
    <rect x="171" y="214" width="9" height="54" rx="3" fill="${C.ouro}"/>
    <path d="M124 274 L140 264 L156 274 M159 274 L175 264 L191 274" fill="none" stroke="${C.ouroEsc}" stroke-width="6"/>
    <path d="M90 150 Q90 110 130 108 Q200 104 226 160 Q230 210 170 222 Q110 228 92 190Z" fill="#D9893F"/>
    <path d="M130 160 Q170 138 202 168 Q182 198 140 190Z" fill="#A8642A"/>
    <path d="M146 172 Q170 162 190 176 M144 182 Q164 176 184 186" fill="none" stroke="#7A4A26"/>
    <path d="M88 160 Q76 120 92 96 L122 96 Q128 126 126 150Z" fill="#E9A93A"/>
    <circle cx="102" cy="84" r="22" fill="#E9A93A"/>
    <path d="M84 68 Q82 46 95 52 Q97 34 110 45 Q116 32 125 49 Q132 56 122 68Z" fill="${C.vermelho}"/>
    <path d="M82 82 L60 90 L82 97Z" fill="${C.ouro}"/>
    <path d="M88 99 Q83 118 94 120 Q101 111 98 99Z" fill="${C.vermelho}"/>
    <circle cx="95" cy="79" r="4" fill="${C.tinta}" stroke="none"/>`);

  /* Arco-íris sobre as nuvens (a aliança com Noé) */
  D['z-arcoiris'] = svgZ(`
    ${['#D7263D', '#F07F2E', '#F4B731', '#4E9F3D', '#2479D8', '#8E44C9'].map((cor, i) => {
      const R = 140 - i * 18, r = R - 18;
      return `<path d="M${150 - R} 215 A${R} ${R} 0 0 1 ${150 + R} 215 L${150 + r} 215 A${r} ${r} 0 0 0 ${150 - r} 215Z" fill="${cor}"/>`;
    }).join('')}
    ${nuvem(48, 222)}${nuvem(252, 222)}`);

  /* Pomba com a folha de oliveira no bico (Gn 8:11) */
  D['z-pomba'] = svgZ(`
    <path d="M62 160 Q22 148 10 176 Q30 176 40 188 Q52 182 74 180Z" fill="#E6E9F2"/>
    <path d="M60 160 Q92 120 160 124 Q204 126 224 110 Q240 106 246 120 Q240 142 214 152 Q190 192 120 192 Q78 190 60 160Z" fill="#FFFFFF"/>
    <path d="M118 142 Q106 58 168 26 Q176 66 166 98 Q192 66 220 58 Q208 112 164 142Z" fill="#F2F4FA"/>
    <path d="M128 132 Q126 90 156 54 M144 136 Q156 100 196 76" fill="none" stroke="#B9C0D4"/>
    <circle cx="232" cy="114" r="17" fill="#FFFFFF"/>
    <circle cx="236" cy="110" r="3.5" fill="${C.tinta}" stroke="none"/>
    <path d="M247 112 L264 118 L247 124Z" fill="${C.ouro}"/>
    <path d="M258 120 Q272 134 290 128" fill="none" stroke="#6B4423" stroke-width="4"/>
    <ellipse cx="270" cy="138" rx="12" ry="5" transform="rotate(30 270 138)" fill="#5E8C3A"/>
    <ellipse cx="284" cy="120" rx="12" ry="5" transform="rotate(-30 284 120)" fill="#5E8C3A"/>
    <ellipse cx="292" cy="134" rx="9" ry="4" transform="rotate(10 292 134)" fill="#6FA046"/>`);

  /* Serpente enrolada, de cabeça erguida */
  const corpoCobra = 'M236 212 Q262 200 250 180 Q236 160 150 160 Q62 160 56 192 Q52 228 150 230 Q236 232 238 206 Q236 188 152 188 Q100 190 110 150 Q120 110 150 90 Q176 72 162 54';
  D['z-serpente'] = svgZ(`
    ${traco(corpoCobra, C.grama, 26)}
    <path d="${corpoCobra}" fill="none" stroke="#2C6221" stroke-width="8" stroke-dasharray="6 18"/>
    <path d="M150 30 L146 12 M150 30 L156 13" fill="none" stroke="${C.vermelho}" stroke-width="4"/>
    <ellipse cx="156" cy="46" rx="24" ry="17" transform="rotate(-20 156 46)" fill="${C.grama}"/>
    <circle cx="148" cy="40" r="4" fill="${C.ouroCla}"/><circle cx="148" cy="40" r="2" fill="${C.tinta}" stroke="none"/>
    <circle cx="166" cy="36" r="4" fill="${C.ouroCla}"/><circle cx="166" cy="36" r="2" fill="${C.tinta}" stroke="none"/>`);

  /* Camelo (dromedário) com manta */
  D['z-camelo'] = svgZ(`
    <rect x="92" y="186" width="14" height="88" rx="6" fill="#C99A5B"/>
    <rect x="118" y="188" width="14" height="86" rx="6" fill="#B98A4D"/>
    <rect x="196" y="186" width="14" height="88" rx="6" fill="#C99A5B"/>
    <rect x="222" y="188" width="14" height="86" rx="6" fill="#B98A4D"/>
    <path d="M252 158 Q266 182 258 204" fill="none" stroke="${C.tinta}" stroke-width="4"/>
    <path d="M80 180 Q80 140 120 132 Q150 70 190 88 Q216 104 240 140 Q262 160 250 186 Q240 202 200 202 L110 202 Q82 200 80 180Z" fill="#D9A866"/>
    <path d="M138 112 Q170 92 202 102 L216 152 L128 152Z" fill="${C.vermelho}"/>
    <path d="M140 124 L208 124 M134 140 L212 140" fill="none" stroke="${C.ouro}" stroke-width="4"/>
    ${repetir(6, i => `<circle cx="${134 + i * 16}" cy="158" r="4" fill="${C.ouro}"/>`)}
    <path d="M94 162 Q60 150 52 110 Q48 86 60 70 L80 72 Q76 100 98 132Z" fill="#D9A866"/>
    <path d="M44 70 Q46 52 70 54 L86 66 Q84 82 70 82 L48 84 Q40 80 44 70Z" fill="#D9A866"/>
    <path d="M70 54 L76 44 L80 58Z" fill="#B98A4D"/>
    <circle cx="62" cy="64" r="3.5" fill="${C.tinta}" stroke="none"/>`);

  /* Escada até as nuvens (o sonho de Jacó) */
  const degraus = repetir(8, i => {
    const t = 0.1 + i * 0.11;
    const x1 = 76 + (196 - 76) * t, y1 = 292 + (62 - 292) * t, x2 = 112 + (228 - 112) * t;
    return traco(`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y1.toFixed(1)}`, C.madeiraCla, 8);
  });
  D['z-escada'] = svgZ(`
    <path d="M214 34 L120 300 L300 300 L300 120Z" fill="rgba(244,183,49,0.25)" stroke="none"/>
    ${degraus}
    <path d="M60 292 L76 292 L196 62 L184 62Z" fill="${C.madeira}"/>
    <path d="M112 292 L128 292 L240 62 L228 62Z" fill="${C.madeira}"/>
    ${nuvem(214, 52, 1.25)}`);

  /* Sal grosso numa tigela de madeira */
  const cristais = [[110, 150], [135, 134], [160, 140], [186, 150], [206, 168], [95, 172], [124, 170], [150, 160],
    [176, 172], [202, 184], [80, 186], [228, 186], [140, 118], [166, 120], [116, 188], [190, 194]];
  D['z-sal'] = svgZ(`
    <path d="M60 192 Q86 120 150 110 Q214 120 240 192Z" fill="#FFFFFF"/>
    ${cristais.map(([x, y], i) => `<rect x="${x - 8}" y="${y - 8}" width="${14 + (i % 3) * 2}" height="${14 + (i % 3) * 2}" rx="2" transform="rotate(${(i * 37) % 90} ${x} ${y})" fill="#F4F7FB" stroke="#9AA6B8" stroke-width="2"/>`).join('')}
    <path d="M48 190 Q150 312 252 190Z" fill="${C.madeira}"/>
    <ellipse cx="150" cy="192" rx="102" ry="16" fill="${C.madeiraCla}"/>
    <path d="M80 222 Q150 262 220 222" fill="none" stroke="${C.madeiraEsc}"/>
    ${[[40, 262], [62, 274], [252, 266], [236, 280]].map(([x, y], i) => `<rect x="${x - 7}" y="${y - 7}" width="13" height="13" rx="2" transform="rotate(${i * 25} ${x} ${y})" fill="#F4F7FB" stroke="#9AA6B8" stroke-width="2"/>`).join('')}`);

  /* Trombeta de chifre de carneiro (shofar) */
  D['z-shofar'] = svgZ(`
    <path d="M30 232 Q58 254 92 242 Q200 200 248 92 Q254 66 264 52 Q290 56 286 88 Q244 236 100 266 Q58 274 28 250Z" fill="#E8D2A6"/>
    <path d="M70 248 Q78 262 92 260 M110 234 Q122 250 136 246 M150 210 Q166 226 180 218 M186 176 Q204 190 216 178 M214 134 Q234 144 244 130 M236 96 Q254 104 262 92" fill="none" stroke="#B89A66" stroke-width="4"/>
    <ellipse cx="275" cy="62" rx="17" ry="11" transform="rotate(20 275 62)" fill="#6B4423"/>
    <path d="M28 250 Q20 240 30 232 Q36 244 40 252Z" fill="#C9A86E"/>`);

  /* Lamparina de barro acesa (as dez virgens) */
  D['z-lamparina'] = svgZ(`
    <circle cx="246" cy="118" r="40" fill="rgba(244,183,49,0.25)" stroke="none"/>
    <path d="M246 150 Q228 130 238 108 Q244 94 246 78 Q258 98 256 118 Q264 132 246 150Z" fill="${C.ouro}"/>
    <path d="M246 146 Q236 132 242 118 Q246 110 247 100 Q254 116 252 126 Q256 136 246 146Z" fill="#FF8A3D" stroke="none"/>
    ${traco('M66 186 Q24 176 34 204 Q44 222 68 210', '#B8662E', 10)}
    <path d="M60 202 Q60 154 150 154 Q214 154 240 176 L262 168 Q274 182 260 198 Q232 222 150 224 Q60 224 60 202Z" fill="${C.bronze}"/>
    <ellipse cx="140" cy="164" rx="24" ry="8" fill="#5A3A22"/>
    ${repetir(7, i => `<circle cx="${92 + i * 18}" cy="200" r="4" fill="${C.bronzeEsc}"/>`)}
    <path d="M86 186 Q150 176 214 186" fill="none" stroke="${C.bronzeEsc}"/>`);

  /* Cacho de uvas */
  const bagos = [[105, 110], [135, 110], [165, 110], [195, 110], [90, 135], [120, 135], [150, 135], [180, 135], [210, 135],
    [105, 160], [135, 160], [165, 160], [195, 160], [120, 185], [150, 185], [180, 185], [135, 210], [165, 210], [150, 235]];
  D['z-uvas'] = svgZ(`
    ${traco('M150 98 Q150 62 172 38', '#6B4423', 7)}
    <path d="M176 40 Q214 10 250 34 Q262 60 238 74 Q250 92 226 96 Q206 104 196 84 Q176 76 176 40Z" fill="#5E8C3A"/>
    <path d="M182 46 L236 56 M204 50 L214 84 M222 54 L240 72" fill="none" stroke="#3E6B26"/>
    <path d="M120 90 Q96 80 104 62 Q114 54 120 66" fill="none" stroke="#5E8C3A" stroke-width="4"/>
    ${bagos.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="#6B2D8C"/><circle cx="${x - 5}" cy="${y - 6}" r="4" fill="#B98AD6" stroke="none"/>`).join('')}`);

  /* Funda de Davi com as pedras lisas do riacho (1 Sm 17:40,49) */
  D['z-funda'] = svgZ(`
    <ellipse cx="150" cy="262" rx="146" ry="36" fill="#8FCBF2"/>
    <path d="M30 262 q20 -8 40 0 M196 280 q20 -8 40 0 M120 288 q16 -6 32 0" fill="none" stroke="#FFFFFF" stroke-width="3"/>
    ${[[66, 256, 24, 16], [112, 270, 19, 12], [156, 254, 22, 15], [204, 268, 17, 11], [244, 254, 21, 14]].map(([x, y, rx, ry]) =>
      `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#A6ABB8"/><ellipse cx="${x - rx * 0.3}" cy="${y - ry * 0.35}" rx="${rx * 0.35}" ry="${ry * 0.25}" fill="#D4D8E0" stroke="none"/>`).join('')}
    ${traco('M104 136 Q86 70 140 30', '#C9A060', 6)}
    ${traco('M196 136 Q214 70 160 30', '#C9A060', 6)}
    <circle cx="150" cy="26" r="13" fill="none" stroke="${C.tinta}" stroke-width="11"/>
    <circle cx="150" cy="26" r="13" fill="none" stroke="#C9A060" stroke-width="5"/>
    <circle cx="150" cy="134" r="26" fill="#9AA0AE"/>
    <ellipse cx="142" cy="124" rx="9" ry="6" fill="#C9CDD6" stroke="none"/>
    <path d="M90 124 Q150 226 210 124 Q204 182 150 190 Q96 182 90 124Z" fill="#8A5A2E"/>
    <path d="M106 150 Q150 200 194 150" fill="none" stroke="#C9A060" stroke-dasharray="6 7"/>`);

  /* Favo de mel com uma abelha */
  const hexagonos = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const s = 22, x = 46 + c * s * 1.732 + (r % 2) * s * 0.866, y = 74 + r * s * 1.5;
      if (((x - 150) / 118) ** 2 + ((y - 162) / 100) ** 2 > 1) continue;
      const pts = repetir(6, k => { const a = Math.PI / 6 + k * Math.PI / 3; return `${(x + s * Math.cos(a)).toFixed(1)},${(y + s * Math.sin(a)).toFixed(1)} `; });
      const cor = (r * 3 + c) % 4 === 0 ? '#FFE08A' : ((r + c) % 3 === 0 ? '#E09A1C' : C.ouro);
      hexagonos.push(`<polygon points="${pts}" fill="${cor}" stroke="#A9720A"/>`);
    }
  }
  D['z-favo'] = svgZ(`
    ${hexagonos.join('')}
    <path d="M110 250 Q112 270 118 274 Q124 270 122 250Z M170 254 Q172 282 178 286 Q184 282 182 254Z" fill="#E09A1C"/>
    <ellipse cx="236" cy="56" rx="18" ry="12" fill="rgba(255,255,255,0.8)" transform="rotate(-30 236 56)"/>
    <ellipse cx="256" cy="54" rx="16" ry="10" fill="rgba(255,255,255,0.8)" transform="rotate(30 256 54)"/>
    <ellipse cx="246" cy="76" rx="22" ry="15" fill="${C.ouro}"/>
    <path d="M238 63 V89 M250 62 V90" fill="none" stroke="${C.tinta}" stroke-width="6"/>
    <circle cx="270" cy="74" r="9" fill="${C.tinta}"/>`);

  /* Cesto trançado */
  /* a trama só aparece dentro do cesto (lados inclinados de 52→76 e 248→224) */
  const trama = repetir(6, f => repetir(12, c => {
    const y = 140 + f * 18, yb = y + 14;
    const esq = 52 + (yb - 124) * (24 / 128) + 3, dir = 248 - (yb - 124) * (24 / 128) - 3;
    const x = 60 + c * 17 + (f % 2) * 8;
    return x >= esq && x + 8 <= dir ? `<rect x="${x}" y="${y}" width="8" height="14" rx="3" fill="#A8803E" stroke="none"/>` : '';
  }));
  D['z-cesto'] = svgZ(`
    ${traco('M86 116 Q150 40 214 116', '#A8803E', 10)}
    <path d="M52 124 L248 124 L224 252 Q150 270 76 252Z" fill="#C9A060"/>
    ${trama}
    <path d="M58 156 H242 M62 174 H238 M66 192 H234 M70 210 H230 M74 228 H226" fill="none" stroke="#8A6630"/>
    <rect x="40" y="110" width="220" height="24" rx="12" fill="#A8803E"/>
    <path d="M52 122 H248" fill="none" stroke="#7A5A28" stroke-dasharray="10 8"/>`);

  /* Estrela no céu noturno (a estrela dos magos) */
  D['z-estrela'] = svgZ(`
    <circle cx="150" cy="150" r="146" fill="#241650"/>
    ${[[60, 70], [92, 210], [230, 60], [244, 200], [200, 250], [70, 140], [120, 260], [250, 130]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#FFF6E3" stroke="none"/>`).join('')}
    <circle cx="150" cy="122" r="46" fill="rgba(255,224,138,0.25)" stroke="none"/>
    <path d="M150 74 Q158 114 196 122 Q158 130 150 170 Q142 130 104 122 Q142 114 150 74Z" transform="rotate(45 150 122)" fill="${C.ouroCla}"/>
    <path d="M150 34 Q160 112 236 122 Q160 132 150 286 Q140 132 64 122 Q140 112 150 34Z" fill="${C.ouro}"/>`);

  /* ==================================================================== CARDÁPIO BÍBLICO */
  function prato(cx, cy, rx) {
    const ry = rx * 0.28;
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#FFFFFF"/>` +
      `<ellipse cx="${cx}" cy="${cy - 2}" rx="${rx * 0.72}" ry="${ry * 0.6}" fill="#F2ECDD" stroke="#D8CFBA"/>`;
  }
  function vapor(x, y) {
    return `<path d="M${x} ${y} q-12 -16 0 -32 q12 -16 0 -32" fill="none" stroke="#B9B2C8" stroke-width="5"/>`;
  }
  function osso(x1, y1, x2, y2) {
    return traco(`M${x1} ${y1} L${x2} ${y2}`, '#FFF6E3', 12) +
      `<circle cx="${x2 + 4}" cy="${y2 - 6}" r="9" fill="#FFF6E3"/><circle cx="${x2 + 8}" cy="${y2 + 5}" r="9" fill="#FFF6E3"/>`;
  }
  function abelha(x, y) {
    return `<ellipse cx="${x - 6}" cy="${y - 12}" rx="9" ry="6" fill="rgba(255,255,255,0.85)"/><ellipse cx="${x + 6}" cy="${y - 13}" rx="9" ry="6" fill="rgba(255,255,255,0.85)"/>
      <ellipse cx="${x}" cy="${y}" rx="15" ry="10" fill="${C.ouro}"/><path d="M${x - 5} ${y - 9} V${y + 9} M${x + 4} ${y - 9} V${y + 9}" fill="none" stroke="${C.tinta}" stroke-width="5"/>
      <circle cx="${x + 16}" cy="${y}" r="6" fill="${C.tinta}"/>`;
  }
  function favoBloco(x0, y0, larg, alt, s) {
    let out = '';
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        const x = x0 + c * s * 1.732 + (r % 2) * s * 0.866, y = y0 + r * s * 1.5;
        if (x > x0 + larg || y > y0 + alt) continue;
        const pts = repetir(6, k => { const a = Math.PI / 6 + k * Math.PI / 3; return `${(x + s * Math.cos(a)).toFixed(1)},${(y + s * Math.sin(a)).toFixed(1)} `; });
        out += `<polygon points="${pts}" fill="${(r + c) % 3 === 0 ? '#E09A1C' : C.ouro}" stroke="#A9720A"/>`;
      }
    }
    return out;
  }
  function espiga(x1, y1, x2, y2, cor) {
    const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI + 90;
    return `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="#B8902E" stroke-width="4"/>` +
      `<ellipse cx="${x2}" cy="${y2}" rx="7" ry="18" transform="rotate(${ang.toFixed(1)} ${x2} ${y2})" fill="${cor || '#E9C25A'}"/>`;
  }
  function gafanhoto(x, y, rot) {
    return `<g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M-40 -10 Q-60 -40 -72 -36 M-36 -12 Q-50 -46 -58 -46" fill="none" stroke="${C.tinta}" stroke-width="3"/>
      <path d="M8 -4 L-8 -32 L-16 -28 L2 2Z" fill="#6A9630"/>
      <path d="M-8 -30 L-30 8" fill="none" stroke="#6A9630" stroke-width="5"/>
      <ellipse cx="0" cy="0" rx="34" ry="11" fill="#7DAA3A"/>
      <ellipse cx="4" cy="-6" rx="24" ry="7" fill="#A9C96A"/>
      <circle cx="-34" cy="-2" r="11" fill="#8DBB45"/>
      <circle cx="-38" cy="-5" r="3" fill="${C.tinta}" stroke="none"/>
      <path d="M-20 8 L-26 20 M-10 9 L-12 22" fill="none" stroke="#6A9630" stroke-width="4"/></g>`;
  }

  /* Gafanhotos com mel silvestre (João Batista) */
  D['c-gafanhotos'] = svgZ(`
    ${prato(128, 236, 112)}
    ${gafanhoto(104, 216, -8)}${gafanhoto(158, 230, 12)}${gafanhoto(118, 246, 2)}
    ${traco('M250 136 L278 70', C.madeira, 6)}
    <path d="M222 214 Q214 154 234 144 L262 144 Q282 154 274 214 Q272 236 248 236 Q224 236 222 214Z" fill="${C.bronze}"/>
    <ellipse cx="248" cy="145" rx="17" ry="6" fill="${C.ouro}"/>
    <path d="M236 150 Q234 172 240 176 Q246 170 244 152Z M256 150 Q258 190 264 194 Q270 188 264 150Z" fill="${C.ouro}"/>
    <ellipse cx="250" cy="134" rx="12" ry="8" fill="${C.ouro}"/>`);

  /* Pão e carne trazidos pelos corvos (Elias) */
  D['c-corvo'] = svgZ(`
    ${prato(150, 238, 120)}
    <ellipse cx="112" cy="214" rx="50" ry="30" fill="${C.madeiraCla}"/>
    <path d="M86 204 Q96 196 104 206 M108 198 Q118 190 126 200 M128 206 Q138 198 144 210" fill="none" stroke="${C.madeiraEsc}"/>
    ${osso(206, 222, 236, 238)}
    <path d="M150 216 Q158 182 198 186 Q224 194 216 222 Q198 242 168 234Z" fill="#8E4A2A"/>
    <path d="M100 62 Q122 4 172 14 Q152 40 142 66Z" fill="#2E2838"/>
    <path d="M146 76 L180 92 L172 70Z" fill="#1E1A28"/>
    <ellipse cx="112" cy="72" rx="40" ry="22" transform="rotate(-8 112 72)" fill="#1E1A28"/>
    <circle cx="72" cy="60" r="17" fill="#1E1A28"/>
    <circle cx="66" cy="56" r="3" fill="#FFFFFF" stroke="none"/>
    <path d="M57 58 L34 64 L57 69Z" fill="#8A8A9A"/>
    <ellipse cx="32" cy="74" rx="12" ry="8" fill="${C.madeiraCla}"/>`);

  /* Ensopado vermelho de lentilhas (Esaú) */
  D['c-lentilhas'] = svgZ(`
    ${vapor(118, 128)}${vapor(150, 118)}${vapor(184, 128)}
    ${traco('M200 152 L262 72', C.madeira, 9)}
    <path d="M48 160 Q150 292 252 160Z" fill="#B8662E"/>
    <path d="M70 196 Q150 262 230 196" fill="none" stroke="#8E4A1E"/>
    <ellipse cx="150" cy="160" rx="102" ry="24" fill="#C0461F"/>
    ${[[110, 156], [130, 164], [152, 152], [172, 166], [190, 156], [96, 166], [138, 172], [168, 150], [206, 164], [120, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#E9874A" stroke="none"/>`).join('')}
    <path d="M128 160 l6 -4 M180 158 l6 4 M104 158 l5 -3" fill="none" stroke="#4E9F3D" stroke-width="4"/>
    <ellipse cx="200" cy="154" rx="14" ry="7" fill="${C.madeiraCla}"/>`);

  /* Legumes e água (Daniel e os amigos) */
  D['c-legumes'] = svgZ(`
    ${prato(128, 238, 114)}
    <path d="M44 232 Q50 196 84 200 Q96 176 128 190 Q158 176 172 200 Q206 200 208 232Z" fill="#6FA046"/>
    <path d="M70 226 Q100 210 128 218 Q160 208 190 224" fill="none" stroke="#3E6B26"/>
    <path d="M70 214 L118 200 L120 212Z" fill="#F07F2E"/><path d="M118 200 l8 -8 M118 200 l10 -2" fill="none" stroke="#4E9F3D" stroke-width="4"/>
    <path d="M126 222 L170 196 L174 208Z" fill="#F07F2E"/><path d="M170 196 l6 -9 M170 196 l10 -1" fill="none" stroke="#4E9F3D" stroke-width="4"/>
    ${[[92, 232], [116, 238], [146, 236]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#4E9F3D"/><circle cx="${x}" cy="${y}" r="8" fill="#D8EDB0" stroke="none"/>`).join('')}
    ${[[172, 226], [184, 232], [164, 236]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="5" fill="#8E5226"/>`).join('')}
    <path d="M222 150 L230 236 Q250 246 270 236 L278 150Z" fill="${C.bronze}"/>
    <ellipse cx="250" cy="150" rx="28" ry="8" fill="#8FCBF2"/>
    <path d="M236 176 Q250 182 266 176" fill="none" stroke="${C.bronzeEsc}"/>`);

  /* Maná e codornizes (Israel no deserto) */
  const flocos = [[30, 252], [52, 240], [74, 258], [96, 246], [120, 260], [142, 248], [60, 272], [88, 280], [116, 278], [40, 284], [150, 274], [168, 262], [134, 288], [22, 268], [104, 236]];
  D['c-mana'] = svgZ(`
    <path d="M0 232 Q150 210 300 232 L300 300 L0 300Z" fill="#E0C890"/>
    ${flocos.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="6" fill="#FFFFFF" stroke="#C9C2A8" stroke-width="2"/>`).join('')}
    <path d="M196 248 L190 276 M214 250 L216 278" fill="none" stroke="#C99A5B" stroke-width="5"/>
    <path d="M150 210 Q160 170 210 168 Q252 170 262 196 Q262 232 214 240 Q170 244 150 210Z" fill="#A8803E"/>
    ${[[184, 200], [204, 190], [222, 206], [196, 220], [236, 194], [214, 222]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#5A3A22" stroke="none"/>`).join('')}
    <path d="M150 210 Q136 214 128 226 Q150 228 162 218Z" fill="#8A6630"/>
    <circle cx="254" cy="170" r="20" fill="#A8803E"/>
    <path d="M240 162 Q254 156 268 164" fill="none" stroke="#FFFFFF" stroke-width="4"/>
    <path d="M272 170 L290 176 L272 180Z" fill="#5A3A22"/>
    <circle cx="260" cy="168" r="3.5" fill="${C.tinta}" stroke="none"/>
    <path d="M244 150 Q248 136 256 140" fill="none" stroke="${C.tinta}" stroke-width="4"/>`);

  /* Peixe assado e favo de mel (Jesus ressuscitado) */
  D['c-peixe-mel'] = svgZ(`
    ${prato(150, 232, 126)}
    <path d="M52 222 Q104 174 186 202 L230 180 L220 222 L232 262 L186 240 Q104 270 52 222Z" fill="${C.madeiraCla}"/>
    <path d="M90 196 L76 244 M116 188 L100 252 M142 186 L126 254 M168 192 L154 250" fill="none" stroke="#5A3A22" stroke-width="5"/>
    <circle cx="70" cy="214" r="5" fill="#FFFFFF"/><circle cx="70" cy="214" r="2" fill="${C.tinta}" stroke="none"/>
    <path d="M56 230 Q66 236 76 232" fill="none"/>
    <g transform="translate(206 150)">${favoBloco(0, 0, 64, 52, 12)}</g>
    <path d="M226 214 Q228 226 234 228 Q240 224 238 212Z" fill="#E09A1C"/>`);

  /* Bezerro cevado da festa (o filho pródigo) */
  D['c-bezerro'] = svgZ(`
    ${prato(150, 242, 132)}
    ${osso(224, 194, 258, 174)}
    <path d="M68 232 Q58 160 140 150 Q222 146 236 210 Q236 242 200 246 L100 246 Q72 244 68 232Z" fill="#A8541E"/>
    <path d="M96 186 Q140 162 196 178 M90 210 Q140 192 214 206" fill="none" stroke="#C86A2A" stroke-width="7"/>
    ${[[60, 252], [78, 262], [236, 254], [252, 246]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="6" transform="rotate(-20 ${x} ${y})" fill="#5E8C3A"/>`).join('')}
    ${[[44, 236], [56, 228], [50, 244], [62, 238]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#6B2D8C"/>`).join('')}
    ${vapor(120, 130)}${vapor(176, 126)}`);

  /* Mel tirado do leão (Sansão) */
  D['c-mel-leao'] = svgZ(`
    ${prato(150, 252, 122)}
    <g>${favoBloco(68, 120, 150, 106, 16)}</g>
    <path d="M90 232 Q92 262 100 266 Q108 262 106 232Z M150 236 Q152 272 160 276 Q168 272 166 236Z M206 230 Q208 254 214 256 Q220 252 220 230Z" fill="#E09A1C"/>
    ${abelha(64, 70)}${abelha(236, 92)}${abelha(170, 52)}`);

  /* Cinco pães e dois peixinhos do menino (Jo 6:9) */
  const tramaCesta = repetir(5, f => repetir(14, c => {
    const y = 186 + f * 16, yb = y + 12;
    const esq = 44 + (yb - 172) * (20 / 88) + 3, dir = 256 - (yb - 172) * (20 / 88) - 3;
    const x = 48 + c * 16 + (f % 2) * 8;
    return x >= esq && x + 8 <= dir ? `<rect x="${x}" y="${y}" width="8" height="12" rx="3" fill="#A8803E" stroke="none"/>` : '';
  }));
  const pao = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="28" ry="19" fill="#D9A24A"/><path d="M${x - 14} ${y - 6} q6 -6 12 0 M${x + 2} ${y - 8} q6 -6 12 0" fill="none" stroke="#A8641E"/>`;
  const peixinho = (x, y, r) => `<g transform="rotate(${r} ${x} ${y})"><path d="M${x + 30} ${y} L${x + 48} ${y - 13} L${x + 48} ${y + 13}Z" fill="#7F9AB8"/>
    <ellipse cx="${x}" cy="${y}" rx="34" ry="13" fill="#9AB2C8"/><circle cx="${x - 20}" cy="${y - 3}" r="3" fill="${C.tinta}" stroke="none"/>
    <path d="M${x - 8} ${y - 10} Q${x - 2} ${y} ${x - 8} ${y + 10}" fill="none" stroke="#6B83A0"/></g>`;
  D['c-paes-peixes'] = svgZ(`
    <path d="M44 172 L256 172 L236 260 Q150 278 64 260Z" fill="#C9A060"/>
    ${tramaCesta}
    ${pao(84, 156)}${pao(216, 156)}${pao(122, 140)}${pao(178, 140)}${pao(150, 160)}
    ${peixinho(118, 112, -12)}${peixinho(184, 110, 10)}
    <rect x="34" y="164" width="232" height="22" rx="11" fill="#A8803E"/>
    <path d="M46 175 H254" fill="none" stroke="#7A5A28" stroke-dasharray="10 8"/>`);

  /* Guisado de cabrito e a pele nos braços (Isaque e Jacó) */
  D['c-cabrito'] = svgZ(`
    ${vapor(112, 118)}${vapor(150, 108)}
    <path d="M44 150 Q36 272 134 274 Q232 272 224 150Z" fill="#B8662E"/>
    <ellipse cx="134" cy="150" rx="92" ry="20" fill="#7A3A1A"/>
    ${[[100, 148], [126, 154], [152, 146], [176, 154], [116, 142]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="7" fill="#A8541E"/>`).join('')}
    <path d="M140 156 l6 -4 M94 154 l6 3" fill="none" stroke="#4E9F3D" stroke-width="4"/>
    <rect x="214" y="248" width="9" height="42" rx="3" fill="#E8E0D0"/><rect x="230" y="250" width="9" height="40" rx="3" fill="#D8D0C0"/>
    <rect x="262" y="248" width="9" height="42" rx="3" fill="#E8E0D0"/><rect x="278" y="250" width="9" height="40" rx="3" fill="#D8D0C0"/>
    <path d="M288 222 l10 -10" fill="none" stroke="${C.tinta}" stroke-width="5"/>
    <ellipse cx="250" cy="234" rx="44" ry="26" fill="#F2EEE6"/>
    <ellipse cx="262" cy="230" rx="14" ry="10" fill="#C9A060" stroke="none"/>
    <path d="M226 172 Q222 150 236 146 Q230 158 234 172Z" fill="#B8AE98"/>
    <path d="M210 198 Q202 176 220 170 L240 178 Q244 204 226 214Z" fill="#F2EEE6"/>
    <ellipse cx="238" cy="182" rx="11" ry="5" transform="rotate(25 238 182)" fill="#E0D6C4"/>
    <path d="M210 208 L206 226 L216 212Z" fill="#D8D0C0"/>
    <circle cx="219" cy="186" r="3" fill="${C.tinta}" stroke="none"/>`);

  /* A fruta proibida (Gn 3). A Bíblia não diz que fruta era, então ela é misteriosa. */
  D['c-fruta'] = svgZ(`
    ${traco('M0 54 Q150 30 300 46', '#7A5A3A', 14)}
    ${[[40, 62, 20], [96, 34, -25], [150, 52, 30], [206, 32, -20], [262, 58, 25]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="9" transform="rotate(${r} ${x} ${y})" fill="#5E8C3A"/>`).join('')}
    ${traco('M250 44 Q236 76 252 96 Q268 116 246 132', '#4E9F3D', 16)}
    <path d="M246 132 L236 150 M246 132 L254 150" fill="none" stroke="${C.vermelho}" stroke-width="3"/>
    <ellipse cx="244" cy="136" rx="15" ry="11" fill="#4E9F3D"/>
    <circle cx="238" cy="133" r="3" fill="${C.ouroCla}"/><circle cx="250" cy="133" r="3" fill="${C.ouroCla}"/>
    ${prato(140, 252, 116)}
    <path d="M140 140 Q138 122 148 112" fill="none" stroke="#6B4423" stroke-width="5"/>
    <ellipse cx="160" cy="118" rx="16" ry="7" transform="rotate(-25 160 118)" fill="#5E8C3A"/>
    <circle cx="140" cy="194" r="58" fill="#B0306A"/>
    <path d="M140 140 Q130 150 140 156 Q150 150 140 140Z" fill="#7A1E48"/>
    ${[[112, 182], [126, 210], [156, 178], [166, 214], [140, 230], [104, 212], [150, 200]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#E7A0C2" stroke="none"/>`).join('')}
    <ellipse cx="112" cy="168" rx="14" ry="22" transform="rotate(30 112 168)" fill="rgba(255,255,255,0.35)" stroke="none"/>
    <text x="214" y="214" font-size="44" font-weight="800" font-family="Lilita One, Arial Black, sans-serif" fill="${C.purpura}" stroke="none">?</text>`);

  /* Cordeiro assado, pão sem fermento e ervas amargas (a primeira Páscoa) */
  D['c-cordeiro'] = svgZ(`
    ${prato(150, 240, 130)}
    ${osso(164, 196, 196, 170)}
    <path d="M50 236 Q44 180 104 172 Q164 168 176 214 Q176 244 146 248 L80 248 Q54 246 50 236Z" fill="#A8541E"/>
    <path d="M70 204 Q110 186 156 198" fill="none" stroke="#C86A2A" stroke-width="7"/>
    <circle cx="222" cy="214" r="44" fill="#E8C88A"/>
    ${repetir(16, i => { const x = 196 + (i % 4) * 17, y = 190 + Math.floor(i / 4) * 16; return `<circle cx="${x}" cy="${y}" r="2.5" fill="#B8862E" stroke="none"/>`; })}
    <path d="M196 196 L250 236 M200 230 L246 194" fill="none" stroke="#D9A85A" stroke-width="3"/>
    ${[[90, 264, -20], [112, 270, 10], [134, 266, -6], [100, 256, 30]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="18" ry="7" transform="rotate(${r} ${x} ${y})" fill="#5E8C3A"/>`).join('')}`);

  /* ==================================================================== PERFIL SECRETO
     Retrato montado em 5 camadas, uma por pista:
       1 silhueta com "?"   2 cenário e roupa   3 rosto (cabelo, barba, véu)
       4 um objeto da história   5 o objeto mais marcante
     Fica em SVG na página (sem ids e sem <style>), para as camadas aparecerem aos poucos. */
  function miolo(s) { return s.replace(/^<svg[^>]*><g[^>]*>/, '').replace(/<\/g><\/svg>$/, ''); }
  function emb(chave, x, y, k) {
    return `<g transform="translate(${x} ${y}) scale(${k})" stroke-width="${(3 / k).toFixed(2)}">${miolo(D[chave])}</g>`;
  }
  function mao(x, y, pele) { return `<circle cx="${x}" cy="${y}" r="12" fill="${pele}"/>`; }

  /* corpo: curva cúbica de cada lado; as faixas da roupa seguem essa curva (sem clipPath) */
  const CORPO = 'M60 300 C60 240 80 214 112 206 L188 206 C220 214 240 240 240 300Z';
  const bez = (t, a, b, c, d) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
  const curva = Array.from({ length: 61 }, (_, i) => [bez(i / 60, 60, 60, 80, 112), bez(i / 60, 300, 240, 214, 206)]);
  function xEsq(y) {
    for (let i = 0; i < curva.length - 1; i++) {
      const [xa, ya] = curva[i], [xb, yb] = curva[i + 1];
      if (y <= ya && y >= yb) return xa + (xb - xa) * ((ya - y) / ((ya - yb) || 1));
    }
    return y >= 300 ? 60 : 112;
  }
  const xDir = y => 300 - xEsq(y);
  function fatia(y1, y2, cor) {
    const pts = [];
    for (let y = y1; y < y2; y += 4) pts.push(`${xEsq(y).toFixed(1)},${y}`);
    pts.push(`${xEsq(y2).toFixed(1)},${y2}`);
    for (let y = y2; y > y1; y -= 4) pts.push(`${xDir(y).toFixed(1)},${y}`);
    pts.push(`${xDir(y1).toFixed(1)},${y1}`);
    return `<polygon points="${pts.join(' ')}" fill="${cor}" stroke="none"/>`;
  }

  function silhueta() {
    const cor = '#8C84A6';
    return `<path d="${CORPO}" fill="${cor}"/><rect x="134" y="170" width="32" height="42" rx="8" fill="${cor}"/>
      <ellipse cx="150" cy="136" rx="40" ry="46" fill="${cor}"/>
      <text x="150" y="160" text-anchor="middle" font-size="66" font-weight="800" font-family="Lilita One, Arial Black, sans-serif" fill="#FFF6E3" stroke="none">?</text>`;
  }

  function roupa(r, pele) {
    let s = '';
    if (r.tipo === 'regata') {
      s += `<path d="${CORPO}" fill="${pele}"/>`;
      s += `<path d="M96 300 C98 250 106 222 122 208 L178 208 C194 222 202 250 204 300Z" fill="${r.cor}"/>`;
      s += `<path d="M78 262 Q86 240 102 240 M222 262 Q214 240 198 240" fill="none" stroke="${C.peleEsc}" stroke-width="4"/>`;
      s += `<path d="M112 300 V262 M188 300 V262" fill="none" stroke="#5A3A22" stroke-dasharray="4 6"/>`;
      return s;
    }
    s += `<path d="${CORPO}" fill="${r.cor}"/>`;
    if (r.tipo === 'listras') {
      let k = 0;
      for (let y = 206; y < 300; y += 14) s += fatia(y, Math.min(300, y + 14), r.cores[k++ % r.cores.length]);
      s += `<path d="${CORPO}" fill="none"/>`;
    }
    if (r.tipo === 'pelos') {
      s += repetir(46, i => {
        const y = 214 + (i * 23) % 82, larg = xDir(y) - xEsq(y) - 20;
        const x = xEsq(y) + 10 + ((i * 37) % Math.max(10, larg));
        return `<path d="M${x.toFixed(0)} ${y} l4 9 M${(x + 6).toFixed(0)} ${y} l3 10" fill="none" stroke="${r.cor2}" stroke-width="2"/>`;
      });
    }
    if (r.manto) s += `<path d="M60 300 C60 244 78 216 104 207 L128 206 Q106 252 104 300Z" fill="${r.manto}"/>`;
    s += `<path d="M126 206 L150 240 L174 206Z" fill="rgba(0,0,0,0.28)"/>`;
    if (r.ouro) s += `<path d="M126 206 L150 240 L174 206" fill="none" stroke="${C.ouro}" stroke-width="6"/>`;
    if (r.faixa) s += fatia(266, 280, r.faixa);
    return s;
  }

  function rosto(f) {
    const pele = f.pele, cab = f.cabelo || {}, cc = cab.cor || '#2E1D12';
    let s = '';
    if (cab.tipo === 'longo') s += `<path d="M106 128 Q100 82 150 80 Q200 82 194 128 L206 238 Q184 226 178 198 L122 198 Q116 226 94 238Z" fill="${cc}"/>`;
    if (cab.tipo === 'trancas') {
      s += [72, 84, 96, 108, 192, 204, 216].map(x => repetir(10, k => `<ellipse cx="${x}" cy="${118 + k * 13}" rx="7" ry="8" fill="${cc}"/>`)).join('');
    }
    s += `<rect x="134" y="168" width="32" height="44" rx="8" fill="${pele}"/>`;
    s += `<ellipse cx="111" cy="138" rx="8" ry="12" fill="${pele}"/><ellipse cx="189" cy="138" rx="8" ry="12" fill="${pele}"/>`;
    s += `<ellipse cx="150" cy="136" rx="40" ry="46" fill="${pele}"/>`;
    if (f.mulher) s += `<circle cx="128" cy="154" r="7" fill="rgba(215,38,61,0.22)" stroke="none"/><circle cx="172" cy="154" r="7" fill="rgba(215,38,61,0.22)" stroke="none"/>`;
    if (f.idoso) s += `<path d="M130 106 Q150 101 170 106 M134 114 Q150 110 166 114" fill="none" stroke="${C.peleEsc}"/>`;
    const sob = f.espanto ? 'M124 114 Q134 106 144 114 M156 114 Q166 106 176 114' : 'M124 122 Q134 116 144 122 M156 122 Q166 116 176 122';
    s += `<path d="${sob}" fill="none" stroke="${f.sobrancelha || cc}" stroke-width="4"/>`;
    s += `<circle cx="135" cy="136" r="5" fill="${C.tinta}" stroke="none"/><circle cx="165" cy="136" r="5" fill="${C.tinta}" stroke="none"/>`;
    s += `<circle cx="137" cy="134" r="1.6" fill="#FFFFFF" stroke="none"/><circle cx="167" cy="134" r="1.6" fill="#FFFFFF" stroke="none"/>`;
    s += `<path d="M150 140 Q145 154 153 156" fill="none"/>`;
    const bc = (f.barba && f.barba.cor) || cc;
    if (f.barba && f.barba.tipo === 'curta') s += `<path d="M112 146 Q116 194 150 198 Q184 194 188 146 Q178 170 150 174 Q122 170 112 146Z" fill="${bc}"/>`;
    if (f.barba && f.barba.tipo === 'longa') s += `<path d="M110 146 Q112 224 150 240 Q188 224 190 146 Q178 172 150 176 Q122 172 110 146Z" fill="${bc}"/>`;
    if (f.barba) s += `<path d="M132 166 Q150 158 168 166 Q150 170 132 166Z" fill="${bc}"/>`;
    if (f.espanto) s += `<ellipse cx="150" cy="${f.barba ? 180 : 168}" rx="7" ry="9" fill="#5A1A22"/>`;
    else if (f.barba) s += `<path d="M141 177 Q150 183 159 177" fill="none"/>`;
    else s += `<path d="M138 164 Q150 176 162 164" fill="none"/>`;
    if (cab.tipo === 'curto' || cab.tipo === 'trancas') s += `<path d="M110 132 Q106 84 150 84 Q194 84 190 132 Q186 110 172 104 Q150 112 128 104 Q114 110 110 132Z" fill="${cc}"/>`;
    if (cab.tipo === 'longo') s += `<path d="M110 130 Q108 86 150 86 Q192 86 190 130 Q178 100 150 102 Q122 100 110 130Z" fill="${cc}"/>`;
    if (cab.tipo === 'cacheado') {
      s += `<path d="M110 132 Q106 84 150 84 Q194 84 190 132 Q186 112 150 106 Q114 112 110 132Z" fill="${cc}"/>`;
      s += [[112, 108], [124, 92], [140, 84], [158, 84], [174, 92], [188, 108], [108, 124], [192, 124]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="${cc}"/>`).join('');
    }
    if (cab.tipo === 'calvo') s += `<path d="M110 146 Q106 118 120 108 Q118 130 122 150Z M190 146 Q194 118 180 108 Q182 130 178 150Z" fill="${cc}"/>`;
    if (cab.tipo === 'veu' || cab.tipo === 'turbante') {
      const fim = cab.tipo === 'veu' ? 240 : 214;
      if (cab.tipo === 'veu') s += `<path d="M116 128 Q150 100 184 128 Q172 110 150 108 Q128 110 116 128Z" fill="${cc}"/>`;
      s += `<path d="M98 ${fim} Q96 140 104 112 Q118 78 150 78 Q182 78 196 112 Q204 140 202 ${fim} L186 ${fim} Q188 168 184 132 Q172 106 150 106 Q128 106 116 132 Q112 168 114 ${fim}Z" fill="${cab.pano}"/>`;
      if (cab.faixa) s += `<path d="M106 112 Q150 92 194 112 L192 124 Q150 104 108 124Z" fill="${cab.faixa}"/>`;
    }
    return s;
  }

  function leao(cx, cy, r) {
    const juba = repetir(14, i => {
      const a = i * Math.PI * 2 / 14;
      return `<circle cx="${(cx + Math.cos(a) * r * 1.05).toFixed(1)}" cy="${(cy + Math.sin(a) * r * 1.05).toFixed(1)}" r="${(r * 0.34).toFixed(1)}" fill="#A8541E"/>`;
    });
    return juba + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#C86A2A"/>` +
      `<ellipse cx="${cx}" cy="${cy + r * 0.08}" rx="${r * 0.68}" ry="${r * 0.72}" fill="#E9B23E"/>` +
      `<circle cx="${cx - r * 0.26}" cy="${cy - r * 0.12}" r="${r * 0.09}" fill="${C.tinta}" stroke="none"/>` +
      `<circle cx="${cx + r * 0.26}" cy="${cy - r * 0.12}" r="${r * 0.09}" fill="${C.tinta}" stroke="none"/>` +
      `<path d="M${cx - r * 0.15} ${cy + r * 0.14} L${cx + r * 0.15} ${cy + r * 0.14} L${cx} ${cy + r * 0.3}Z" fill="#5A3A22"/>` +
      `<path d="M${cx} ${cy + r * 0.3} V${cy + r * 0.42} M${cx - r * 0.22} ${cy + r * 0.52} Q${cx} ${cy + r * 0.38} ${cx + r * 0.22} ${cy + r * 0.52}" fill="none"/>`;
  }
  function chama(x, base, h) {
    return `<path d="M${x - 24} ${base} Q${x - 30} ${base - h * 0.5} ${x} ${base - h} Q${x + 30} ${base - h * 0.5} ${x + 24} ${base}Z" fill="#F07F2E"/>` +
      `<path d="M${x - 12} ${base} Q${x - 14} ${base - h * 0.4} ${x} ${base - h * 0.62} Q${x + 14} ${base - h * 0.4} ${x + 12} ${base}Z" fill="${C.ouro}" stroke="none"/>`;
  }
  const estrelas = pts => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5" fill="#FFF6E3" stroke="none"/>`).join('');

  /* cenários (camada 2), ocupam o quadro todo */
  const CEN = {
    noite: `<rect width="300" height="300" fill="#2B2F6B" stroke="none"/>${estrelas([[30, 40], [70, 90], [120, 30], [200, 50], [250, 100], [270, 30], [40, 150], [262, 170]])}
      <path d="M236 52 A26 26 0 1 0 258 92 A20 20 0 1 1 236 52Z" fill="${C.ouroCla}"/>
      <path d="M0 240 Q90 214 170 236 Q240 222 300 238 L300 300 L0 300Z" fill="#C9A060"/>`,
    deserto: `<rect width="300" height="300" fill="#F6D9A0" stroke="none"/><path d="M30 250 L140 80 L260 250Z" fill="#B8875A"/>
      <path d="M140 80 L180 142 L160 150 L140 120 L118 146 L106 136Z" fill="#9A6E46"/><path d="M0 236 Q100 208 190 232 Q250 218 300 230 L300 300 L0 300Z" fill="#E0B865"/>`,
    palacio: `<rect width="300" height="300" fill="#6C3A8E" stroke="none"/>
      <path d="M0 0 H300 V40 Q225 90 150 40 Q75 90 0 40Z" fill="#8E44C9"/>
      <rect x="10" y="40" width="36" height="260" fill="${C.ouro}"/><rect x="254" y="40" width="36" height="260" fill="${C.ouro}"/>
      <path d="M22 40 V300 M34 40 V300 M266 40 V300 M278 40 V300" fill="none" stroke="${C.ouroEsc}"/>`,
    babilonia: `<rect width="300" height="300" fill="#2F5FA8" stroke="none"/>
      ${repetir(15, i => `<path d="M0 ${i * 20} H300" fill="none" stroke="#244C88" stroke-width="2"/>`)}
      ${repetir(15, i => repetir(8, c => `<path d="M${c * 40 + (i % 2) * 20} ${i * 20} V${i * 20 + 20}" fill="none" stroke="#244C88" stroke-width="2"/>`))}
      <rect x="0" y="80" width="300" height="22" fill="${C.ouro}"/>${repetir(8, i => `<circle cx="${18 + i * 38}" cy="91" r="7" fill="#FFFFFF"/>`)}`,
    mar: `<rect width="300" height="300" fill="#BFE3FF" stroke="none"/><path d="M0 160 Q70 120 140 150 Q220 118 300 150 L300 180 L0 180Z" fill="#9C8A5A"/>
      <rect x="0" y="174" width="300" height="126" fill="${C.azul}"/><path d="M10 200 q15 -10 30 0 q15 10 30 0 M200 214 q15 -10 30 0 q15 10 30 0 M90 240 q15 -10 30 0" fill="none" stroke="#FFFFFF" stroke-width="3"/>`,
    campo: `<rect width="300" height="300" fill="#CFE8FF" stroke="none"/><circle cx="246" cy="58" r="26" fill="${C.ouroCla}"/>
      <rect x="0" y="168" width="300" height="132" fill="#E9C25A"/>${repetir(16, i => `<path d="M${i * 20 + 6} 300 L${i * 20 + 12} 176" fill="none" stroke="#C9A23A" stroke-width="3"/>`)}`,
    jerico: `<rect width="300" height="300" fill="#FFE2B0" stroke="none"/>
      <path d="M0 150 H300 V300 H0Z" fill="#E8D2A6"/>${repetir(15, i => `<rect x="${i * 20}" y="138" width="12" height="14" fill="#E8D2A6"/>`)}
      ${[[34, 40], [266, 50]].map(([x, y]) => `<path d="M${x - 5} 300 L${x - 3} ${y + 20} L${x + 3} ${y + 20} L${x + 5} 300Z" fill="#8A6630"/>
        <path d="M${x} ${y + 20} Q${x - 40} ${y} ${x - 46} ${y + 30} M${x} ${y + 20} Q${x + 40} ${y} ${x + 46} ${y + 30} M${x} ${y + 20} Q${x - 20} ${y - 14} ${x - 30} ${y - 4} M${x} ${y + 20} Q${x + 20} ${y - 14} ${x + 30} ${y - 4}" fill="none" stroke="#4E9F3D" stroke-width="10"/>`).join('')}`,
    colinas: `<rect width="300" height="300" fill="#CDEBFF" stroke="none"/><path d="M0 170 Q80 110 170 160 Q230 120 300 150 L300 300 L0 300Z" fill="#7CC05A"/>
      <path d="M0 220 Q100 180 200 214 Q260 200 300 210 L300 300 L0 300Z" fill="#5EA544"/>`,
    estrada: `<rect width="300" height="300" fill="#FFF0C8" stroke="none"/><path d="M0 170 Q90 140 160 166 Q230 146 300 164 L300 300 L0 300Z" fill="#D9B77A"/>
      <path d="M130 166 L170 166 L250 300 L50 300Z" fill="#C9A060"/><path d="M150 176 V196 M150 214 V240 M150 260 V292" fill="none" stroke="#FFF6E3" stroke-width="4"/>`,
    chuva: `<rect width="300" height="300" fill="#8E98B0" stroke="none"/>${nuvem(70, 50, 1.1).replace(/#FFFFFF/g, '#6B7590')}${nuvem(230, 40, 1.2).replace(/#FFFFFF/g, '#6B7590')}
      ${repetir(18, i => `<path d="M${(i * 41) % 300} ${100 + (i * 29) % 120} l-8 18" fill="none" stroke="#DCE4F2" stroke-width="3"/>`)}
      <path d="M0 250 Q150 230 300 250 L300 300 L0 300Z" fill="#6B8A5A"/>`,
    pasto: `<rect width="300" height="300" fill="#CDEBFF" stroke="none"/><path d="M0 170 Q150 140 300 170 L300 300 L0 300Z" fill="#7CC05A"/>
      ${[[40, 196], [262, 186], [230, 220]].map(([x, y]) => `<circle cx="${x - 10}" cy="${y}" r="10" fill="#FFFFFF"/><circle cx="${x + 2}" cy="${y - 5}" r="11" fill="#FFFFFF"/><circle cx="${x + 12}" cy="${y + 2}" r="9" fill="#FFFFFF"/><circle cx="${x + 20}" cy="${y - 4}" r="6" fill="${C.tinta}"/>`).join('')}`,
    monte: `<rect width="300" height="300" fill="#F2C9A0" stroke="none"/><path d="M0 260 L90 90 L150 160 L210 70 L300 240 L300 300 L0 300Z" fill="#8A7A6A"/>
      <path d="M90 90 L118 150 L96 160 Z M210 70 L240 136 L214 132Z" fill="#6E6052"/>`,
    tempestade: `<rect width="300" height="300" fill="#3F4A66" stroke="none"/><path d="M220 20 L196 76 L214 76 L190 130 L238 64 L218 64 L240 20Z" fill="${C.ouro}"/>
      <path d="M0 200 Q40 170 80 200 Q120 170 160 200 Q200 170 240 200 Q270 176 300 196 L300 300 L0 300Z" fill="#23466B"/>
      <path d="M20 190 q20 -14 40 0 M120 188 q20 -14 40 0 M220 188 q20 -14 40 0" fill="none" stroke="#FFFFFF" stroke-width="4"/>`,
    muralha: `<rect width="300" height="300" fill="#CDEBFF" stroke="none"/><rect x="0" y="60" width="300" height="240" fill="#D9C29A"/>
      ${repetir(12, i => `<path d="M0 ${60 + i * 20} H300" fill="none" stroke="#BFA77C" stroke-width="2"/>`)}
      ${repetir(12, i => repetir(7, c => `<path d="M${c * 46 + (i % 2) * 23} ${60 + i * 20} V${80 + i * 20}" fill="none" stroke="#BFA77C" stroke-width="2"/>`))}
      ${repetir(13, i => `<rect x="${i * 24}" y="46" width="14" height="16" fill="#D9C29A"/>`)}`
  };

  /* objetos das camadas 4 e 5: "a" fica atrás da pessoa, "f" na frente */
  const OBJ = {
    trigo: p => ({ f: [[34, 154], [50, 144], [68, 140], [86, 144], [100, 154]].map(([x, y]) => espiga(68, 272, x, y)).join('') + `<rect x="54" y="228" width="28" height="12" rx="4" fill="#8E5226"/>` }),
    colarEgito: p => ({
      a: `<path d="M0 252 L52 176 L104 252Z" fill="#E0B865"/><path d="M52 176 L104 252 L80 252Z" fill="#C99A4A" stroke="none"/><path d="M200 252 L254 184 L300 236 L300 252Z" fill="#E0B865"/>`,
      f: `<path d="M110 210 Q150 268 190 210 L178 207 Q150 250 122 207Z" fill="${C.ouro}"/>` +
        [[122, 222], [136, 236], [150, 242], [164, 236], [178, 222]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="5" fill="${i % 2 ? C.azul : C.vermelho}"/>`).join('')
    }),
    cajado: p => ({ f: traco('M250 300 L250 96 Q250 62 224 64 Q206 68 210 86', C.madeira, 9) + mao(250, 238, p) }),
    tabuas: p => ({
      f: `<path d="M16 300 L16 194 Q16 168 42 168 Q68 168 68 194 L68 300Z" fill="${C.pedra2}"/><path d="M56 300 L56 204 Q56 178 82 178 Q108 178 108 204 L108 300Z" fill="${C.pedra}"/>` +
        repetir(5, i => `<path d="M24 ${202 + i * 16} H60 M64 ${212 + i * 16} H100" fill="none" stroke="${C.pedra3}" stroke-width="4"/>`) + mao(100, 262, p)
    }),
    cetro: p => ({ f: traco('M226 300 L262 150', C.ouroEsc, 8) + `<circle cx="264" cy="142" r="13" fill="${C.ouroCla}"/>` + mao(236, 258, p) }),
    coroa: p => ({ f: `<path d="M114 98 L114 66 L132 82 L150 56 L168 82 L186 66 L186 98Z" fill="${C.ouro}"/><circle cx="150" cy="86" r="5" fill="${C.vermelho}"/><circle cx="128" cy="91" r="4" fill="${C.azul}"/><circle cx="172" cy="91" r="4" fill="${C.azul}"/>` }),
    janela: p => ({
      a: `<path d="M16 162 L16 72 Q16 30 58 30 Q100 30 100 72 L100 162Z" fill="#5A3A22"/><path d="M26 152 L26 74 Q26 40 58 40 Q90 40 90 74 L90 152Z" fill="#9FD3F5"/><path d="M58 40 V152 M26 98 H90" fill="none" stroke="#5A3A22" stroke-width="5"/>`,
      f: `<path d="M138 290 Q132 252 146 236 Q150 232 154 236 Q168 252 162 290Z" fill="${p}"/><path d="M150 238 V290" fill="none"/>`
    }),
    leao: p => ({ f: leao(58, 252, 42) + leao(254, 268, 28) }),
    rede: p => ({
      f: `<path d="M8 300 Q4 222 46 204 Q96 196 106 244 L102 300Z" fill="#E8DCC0"/>` +
        repetir(6, i => `<path d="M${14 + i * 15} 300 L${42 + i * 10} 210" fill="none" stroke="#A8906A" stroke-width="2"/>`) +
        repetir(5, i => `<path d="M${14 + i * 3} ${290 - i * 16} Q60 ${282 - i * 16} 102 ${290 - i * 16}" fill="none" stroke="#A8906A" stroke-width="2"/>`) +
        `<ellipse cx="46" cy="264" rx="20" ry="9" fill="#9AB2C8"/><path d="M64 264 L76 256 L76 272Z" fill="#9AB2C8"/><ellipse cx="74" cy="236" rx="16" ry="8" fill="#B8C8D8"/>`
    }),
    galo: p => ({ f: emb('z-galo', 190, 182, 0.38) }),
    espigasChao: p => ({
      f: [[28, 192], [48, 180], [70, 182], [92, 194]].map(([x, y]) => espiga(60, 252, x, y)).join('') +
        `<path d="M14 300 L22 246 L98 246 L106 300Z" fill="#C9A060"/>` + repetir(3, i => `<path d="M${20 + i * 3} ${262 + i * 12} H${102 - i * 3}" fill="none" stroke="#8A6630"/>`)
    }),
    feixeBracos: p => ({
      f: [[178, 168], [198, 162], [216, 166], [232, 176], [246, 190]].map(([x, y]) => espiga(118, 292, x, y)).join('') +
        `<rect x="146" y="226" width="30" height="12" rx="4" transform="rotate(-40 161 232)" fill="#8E5226"/>` + mao(132, 260, p) + mao(192, 236, p)
    }),
    moedas: p => ({
      f: `<path d="M214 300 Q200 260 228 238 L222 224 L256 224 L250 238 Q280 260 266 300Z" fill="#B8873E"/><path d="M222 232 H256" fill="none" stroke="#5A3A22" stroke-width="5"/>` +
        [[206, 290], [222, 296], [278, 292], [262, 298]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="5" fill="${C.ouro}"/>`).join('')
    }),
    arvore: p => ({
      a: `<path d="M14 300 L26 120 L50 120 L58 300Z" fill="#7A5A3A"/>` +
        [[30, 40, 46], [92, 20, 44], [160, 14, 44], [230, 24, 46], [286, 62, 42], [0, 96, 40]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#4E9F3D"/>`).join('') +
        [[62, 62, 28], [204, 58, 28]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#438A34"/>`).join(''),
      f: traco('M0 270 Q120 252 300 264', '#7A5A3A', 18) + [[30, 248], [270, 250]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="18" ry="9" fill="#4E9F3D"/>`).join('')
    }),
    favo: p => ({ f: emb('z-favo', 194, 188, 0.36) }),
    colunas: p => ({
      a: [8, 246].map(x => `<rect x="${x}" y="40" width="46" height="260" fill="${C.pedra2}"/><rect x="${x - 6}" y="26" width="58" height="18" fill="${C.pedra3}"/>
        <path d="M${x + 14} 44 V300 M${x + 32} 44 V300" fill="none" stroke="${C.pedra3}"/><path d="M${x + 8} 118 l14 18 l-6 16 l12 14" fill="none"/>`).join('') +
        [[96, 30], [196, 20], [150, 8]].map(([x, y]) => `<rect x="${x}" y="${y}" width="16" height="14" fill="${C.pedra3}" transform="rotate(20 ${x} ${y})"/>`).join('')
    }),
    tenda: p => ({ a: `<path d="M4 236 L60 150 L116 236Z" fill="#C9A060"/><path d="M60 150 L44 236 M60 150 L76 236" fill="none" stroke="#8A6630"/><path d="M48 236 L60 198 L72 236Z" fill="#5A3A22"/><path d="M60 150 V136" fill="none" stroke-width="4"/>` }),
    carta: p => ({
      f: repetir(5, i => `<ellipse cx="${196 - i * 14}" cy="${272 + i * 6}" rx="8" ry="5" fill="none" stroke="#6B6F7E" stroke-width="4"/>`) +
        `<rect x="206" y="226" width="64" height="58" fill="#F1DEB3"/>` + repetir(4, i => `<path d="M214 ${240 + i * 11} H${262 - (i % 2) * 12}" fill="none" stroke="#8A6630" stroke-width="3"/>`) +
        `<rect x="198" y="218" width="80" height="12" rx="6" fill="#D9B77A"/><rect x="198" y="280" width="80" height="12" rx="6" fill="#D9B77A"/>` + mao(206, 262, p)
    }),
    pomba: p => ({ f: emb('z-pomba', 184, 16, 0.38) }),
    arcoIris: p => ({ a: `<g transform="translate(0 -46)">${miolo(D['z-arcoiris'])}</g>` }),
    harpa: p => ({
      f: traco('M42 256 Q18 196 46 166', C.madeiraEsc, 9) + traco('M102 256 Q126 196 98 166', C.madeiraEsc, 9) + traco('M40 170 L104 170', C.madeira, 8) +
        repetir(5, i => `<path d="M${52 + i * 10} 172 V250" fill="none" stroke="${C.linho}" stroke-width="2"/>`) +
        `<rect x="30" y="246" width="84" height="38" rx="10" fill="${C.madeira}"/>` + mao(104, 214, p)
    }),
    funda: p => ({
      f: `<path d="M244 236 Q276 180 252 140 M244 236 Q262 176 240 140" fill="none" stroke="#8A6630" stroke-width="3"/><ellipse cx="246" cy="134" rx="16" ry="11" fill="#8A6630"/><circle cx="246" cy="128" r="9" fill="#9AA0AE"/>` +
        mao(244, 240, p) + [[214, 290], [232, 294], [252, 288], [270, 296], [226, 280]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#9AA0AE"/>`).join('')
    }),
    corvo: p => ({
      f: `<path d="M62 52 Q76 12 114 18 Q100 38 94 56Z" fill="#2E2838"/><ellipse cx="68" cy="62" rx="30" ry="16" transform="rotate(-10 68 62)" fill="#1E1A28"/>
        <path d="M94 66 L116 78 L110 60Z" fill="#1E1A28"/><circle cx="40" cy="54" r="12" fill="#1E1A28"/><circle cx="36" cy="51" r="2.5" fill="#FFFFFF" stroke="none"/>
        <path d="M30 54 L14 58 L30 62Z" fill="#8A8A9A"/><ellipse cx="12" cy="66" rx="9" ry="6" fill="${C.madeiraCla}"/>`
    }),
    fogo: p => ({
      a: [[20, 70], [44, 96], [72, 120], [228, 120], [256, 96], [280, 70]].map(([x, h]) => chama(x, 300, h + 60)).join('') +
        `<circle cx="56" cy="246" r="36" fill="none" stroke="${C.ouroEsc}" stroke-width="8"/>` +
        repetir(6, i => { const a = i * Math.PI / 3; return `<path d="M56 246 L${(56 + Math.cos(a) * 34).toFixed(1)} ${(246 + Math.sin(a) * 34).toFixed(1)}" fill="none" stroke="${C.ouroEsc}" stroke-width="5"/>`; })
    }),
    navio: p => ({ a: `<g transform="rotate(-12 70 90)"><path d="M20 96 L120 96 L104 122 L36 122Z" fill="${C.madeira}"/><path d="M70 96 V30" fill="none" stroke-width="4"/><path d="M72 34 L112 88 L72 88Z" fill="${C.linho}"/></g>` }),
    peixe: p => ({
      a: `<ellipse cx="200" cy="110" rx="170" ry="100" fill="#5B7FA6"/><ellipse cx="210" cy="160" rx="130" ry="44" fill="#8FB0CF" stroke="none"/>
        <path d="M30 110 L130 70 L130 150Z" fill="#2B2246"/><path d="M150 12 Q200 -10 250 14Z" fill="#46688F"/>
        <circle cx="96" cy="58" r="17" fill="#FFFFFF"/><circle cx="92" cy="58" r="8" fill="${C.tinta}"/>`
    }),
    linho: p => ({
      f: repetir(7, i => `<path d="M${30 + i * 8} 300 L${22 + i * 12} ${200 + (i % 3) * 8}" fill="none" stroke="#9AAE5A" stroke-width="4"/><circle cx="${22 + i * 12}" cy="${196 + (i % 3) * 8}" r="5" fill="#6FA0D8"/>`) +
        `<rect x="24" y="262" width="64" height="12" rx="4" fill="#C9A060"/>`
    }),
    cordao: p => ({
      a: `<rect x="198" y="20" width="80" height="72" fill="#5A3A22"/><rect x="208" y="30" width="60" height="52" fill="#2B2246"/>`,
      f: traco('M246 84 Q264 170 244 300', C.vermelho, 7)
    })
  };

  const PERSONAGENS = {
    jose: { pele: '#C98D63', cabelo: { tipo: 'curto', cor: '#2E1D12' }, roupa: { tipo: 'listras', cor: '#D7263D', cores: ['#D7263D', '#F4B731', '#2479D8', '#4E9F3D', '#8E44C9'] }, cenario: 'noite', p4: 'trigo', p5: 'colarEgito' },
    moises: { pele: '#C98D63', idoso: true, sobrancelha: '#EDEDED', cabelo: { tipo: 'turbante', pano: '#E8D9B5', faixa: '#8E5226' }, barba: { tipo: 'longa', cor: '#F2F2F2' }, roupa: { cor: '#8A5A2E', manto: '#C9A060', faixa: '#5A3A22' }, cenario: 'deserto', p4: 'cajado', p5: 'tabuas' },
    ester: { pele: '#D9A273', mulher: true, cabelo: { tipo: 'longo', cor: '#1E120A' }, roupa: { cor: '#8E44C9', ouro: true, faixa: '#F4B731' }, cenario: 'palacio', p4: 'cetro', p5: 'coroa' },
    daniel: { pele: '#C98D63', cabelo: { tipo: 'curto', cor: '#2E1D12' }, barba: { tipo: 'curta' }, roupa: { cor: '#2479D8', manto: '#124A8C', faixa: '#F4B731' }, cenario: 'babilonia', p4: 'janela', p5: 'leao' },
    pedro: { pele: '#B97A52', cabelo: { tipo: 'curto', cor: '#6E625A' }, barba: { tipo: 'curta', cor: '#7E726A' }, roupa: { cor: '#9C7B52', faixa: '#5A3A22' }, cenario: 'mar', p4: 'rede', p5: 'galo' },
    rute: { pele: '#D9A273', mulher: true, cabelo: { tipo: 'veu', cor: '#3B2414', pano: '#E8D2A6' }, roupa: { cor: '#B85C3A', faixa: '#E8D2A6' }, cenario: 'campo', p4: 'espigasChao', p5: 'feixeBracos' },
    zaqueu: { pele: '#C98D63', cabelo: { tipo: 'curto', cor: '#1E120A' }, barba: { tipo: 'curta' }, roupa: { cor: '#2E8B57', ouro: true, manto: '#8E1426', faixa: '#F4B731' }, cenario: 'jerico', p4: 'moedas', p5: 'arvore' },
    sansao: { pele: '#B97A52', cabelo: { tipo: 'trancas', cor: '#2E1D12' }, barba: { tipo: 'curta' }, roupa: { tipo: 'regata', cor: '#8A5A2E' }, cenario: 'colinas', p4: 'favo', p5: 'colunas' },
    paulo: { pele: '#C98D63', cabelo: { tipo: 'calvo', cor: '#3B2A1E' }, barba: { tipo: 'longa', cor: '#3B2A1E' }, roupa: { cor: '#C9A060', manto: '#8E1426' }, cenario: 'estrada', p4: 'tenda', p5: 'carta' },
    noe: { pele: '#C98D63', idoso: true, sobrancelha: '#EDEDED', cabelo: { tipo: 'curto', cor: '#EDEDED' }, barba: { tipo: 'longa', cor: '#F2F2F2' }, roupa: { cor: '#7A5A3A', manto: '#A8803E' }, cenario: 'chuva', p4: 'pomba', p5: 'arcoIris' },
    davi: { pele: '#D9A273', cabelo: { tipo: 'cacheado', cor: '#6B3418' }, roupa: { cor: '#D9C29A', faixa: '#8E5226' }, cenario: 'pasto', p4: 'harpa', p5: 'funda' },
    elias: { pele: '#B97A52', cabelo: { tipo: 'longo', cor: '#2E1D12' }, barba: { tipo: 'longa' }, roupa: { tipo: 'pelos', cor: '#6B4A2E', cor2: '#3B2414', faixa: '#3B2414' }, cenario: 'monte', p4: 'corvo', p5: 'fogo' },
    jonas: { pele: '#C98D63', espanto: true, cabelo: { tipo: 'turbante', cor: '#2E1D12', pano: '#6FA0C8', faixa: '#2E5E8C' }, barba: { tipo: 'curta' }, roupa: { cor: '#5B7FA6' }, cenario: 'tempestade', p4: 'navio', p5: 'peixe' },
    raabe: { pele: '#D9A273', mulher: true, cabelo: { tipo: 'longo', cor: '#3B2414' }, roupa: { cor: '#D7263D', ouro: true }, cenario: 'muralha', p4: 'linho', p5: 'cordao' }
  };

  function montarRetrato(cfg) {
    const o4 = OBJ[cfg.p4](cfg.pele), o5 = OBJ[cfg.p5](cfg.pele);
    const cam = (n, conteudo) => conteudo ? `<g class="camada" data-n="${n}">${conteudo}</g>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">` +
      `<g stroke="${C.tinta}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">` +
      cam(1, `<rect width="300" height="300" fill="#D9D2E6" stroke="none"/><circle cx="150" cy="150" r="118" fill="#E6E0F0" stroke="none"/>`) +
      cam(2, CEN[cfg.cenario]) + cam(4, o4.a) + cam(5, o5.a) +
      cam(1, silhueta()) + cam(2, roupa(cfg.roupa, cfg.pele)) + cam(3, rosto(cfg)) + cam(4, o4.f) + cam(5, o5.f) +
      `</g></svg>`;
  }
  const RETRATOS = {};
  Object.keys(PERSONAGENS).forEach(k => { RETRATOS[k] = montarRetrato(PERSONAGENS[k]); });
  window.ARTE_RETRATOS = RETRATOS;

  /* ---------------------------------------------------------------- emblema
     Cálice: "Jesus que cura", um dos quatro símbolos da Igreja do Evangelho
     Quadrangular (com a cruz, a pomba e a coroa), na tela inicial.
     Aparece pequeno, então leva um contorno bem grosso em volta da silhueta. */
  {
    const taca = 'M28 34 H172 Q174 112 100 134 Q26 112 28 34Z';
    const pe = 'M50 222 Q54 192 88 180 H112 Q146 192 150 222Z';
    const silhueta = `<path d="${taca}"/><ellipse cx="100" cy="34" rx="72" ry="15"/>
      <rect x="89" y="126" width="22" height="60" rx="6"/><ellipse cx="100" cy="156" rx="21" ry="11"/>
      <path d="${pe}"/><rect x="40" y="214" width="120" height="20" rx="10"/>`;
    D.calice = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="16 8 168 236">` +
      `<g fill="${C.tinta}" stroke="${C.tinta}" stroke-width="14" stroke-linejoin="round">${silhueta}</g>` +
      `<g stroke="none">
        <path d="${taca}" fill="${C.ouro}"/>
        <path d="M31 62 Q100 80 169 62 L168 74 Q100 92 32 74Z" fill="${C.ouroEsc}"/>
        <path d="M46 52 Q48 94 80 116 Q60 92 60 52Z" fill="#FFFFFF" opacity="0.5"/>
        <ellipse cx="100" cy="34" rx="72" ry="15" fill="${C.ouroCla}"/>
        <ellipse cx="100" cy="35" rx="60" ry="9" fill="${C.ouroEsc}"/>
        <rect x="89" y="126" width="22" height="60" rx="6" fill="${C.ouro}"/>
        <ellipse cx="100" cy="156" rx="21" ry="11" fill="${C.ouroEsc}"/>
        <ellipse cx="94" cy="153" rx="8" ry="4" fill="${C.ouroCla}"/>
        <path d="${pe}" fill="${C.ouro}"/>
        <path d="M66 214 Q72 196 92 188 Q78 200 78 214Z" fill="#FFFFFF" opacity="0.45"/>
        <rect x="40" y="214" width="120" height="20" rx="10" fill="${C.ouroEsc}"/>
      </g></svg>`;
  }

  /* ---------------------------------------------------------------- saída */
  const saida = {};
  Object.keys(D).forEach(k => {
    const vb = D[k].match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    saida[k] = {
      svg: D[k],
      ar: vb[2] / vb[3],
      url: 'data:image/svg+xml;base64,' + btoa(D[k])
    };
  });
  return saida;
})();
