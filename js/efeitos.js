/* Confete e contadores animados. */
window.Efeitos = (function () {
  const reduzir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.getElementById('confete');
  const cx = cv.getContext('2d');
  const CORES = ['#D7263D', '#F4B731', '#2479D8', '#8E44C9', '#FFF6E3', '#3DBE7A'];
  let parts = [];
  let rodando = false;
  let dpr = 1;

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr;
    cv.height = innerHeight * dpr;
  }
  medir();
  window.addEventListener('resize', medir);

  function nova(x, y, vx, vy) {
    return {
      x, y, vx, vy,
      g: 0.32 + Math.random() * 0.12,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.35,
      w: 8 + Math.random() * 9,
      h: 5 + Math.random() * 6,
      cor: CORES[(Math.random() * CORES.length) | 0],
      vida: 0,
      forma: Math.random() < 0.25 ? 'c' : 'r'
    };
  }

  function confete(opc) {
    const o = Object.assign({ x: 0.5, y: 0.4, qtd: 140, forca: 1 }, opc || {});
    const n = reduzir ? Math.round(o.qtd / 4) : o.qtd;
    const px = o.x * innerWidth, py = o.y * innerHeight;
    for (let i = 0; i < n; i++) {
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const vel = (7 + Math.random() * 11) * o.forca;
      parts.push(nova(px, py, Math.cos(ang) * vel, Math.sin(ang) * vel));
    }
    iniciar();
  }

  function chuva(qtd) {
    const n = reduzir ? 40 : (qtd || 220);
    for (let i = 0; i < n; i++) {
      parts.push(nova(Math.random() * innerWidth, -20 - Math.random() * innerHeight * 0.6, (Math.random() - 0.5) * 2, Math.random() * 3));
    }
    iniciar();
  }

  let antes = 0;
  function iniciar() {
    if (rodando) return;
    rodando = true;
    antes = performance.now();
    requestAnimationFrame(passo);
  }

  /* Física baseada no tempo real: o confete dura o mesmo
     em um computador rápido ou lento. */
  function passo(agora) {
    const k = Math.min(4, Math.max(0.2, (agora - antes) / 16.67));
    antes = agora;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.y < innerHeight + 40 && p.vida < 260);
    for (const p of parts) {
      p.vida += k;
      p.vx *= Math.pow(0.985, k);
      p.vy = Math.min(p.vy + p.g * k, 7);
      p.x += (p.vx + Math.sin((p.vida + p.w) / 12) * 0.6) * k;
      p.y += p.vy * k;
      p.r += p.vr * k;
      cx.save();
      cx.translate(p.x, p.y);
      cx.rotate(p.r);
      cx.fillStyle = p.cor;
      if (p.forma === 'c') {
        cx.beginPath(); cx.arc(0, 0, p.h * 0.6, 0, Math.PI * 2); cx.fill();
      } else {
        cx.scale(1, Math.cos(p.vida / 7));
        cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      cx.restore();
    }
    if (parts.length) requestAnimationFrame(passo);
    else { rodando = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  /* Conta de "de" até "ate" em "ms" milissegundos, escrevendo em el. */
  function contar(el, de, ate, ms, fmt) {
    if (!el) return;
    const f = fmt || (v => Math.round(v).toLocaleString('pt-BR'));
    if (reduzir || ms <= 0) { el.textContent = f(ate); return; }
    const t0 = performance.now();
    const log = de > 0 && ate > 0 && Math.max(de, ate) / Math.min(de, ate) > 50;
    function q(agora) {
      const t = Math.min(1, (agora - t0) / ms);
      const e = 1 - Math.pow(1 - t, 3);
      const v = log ? Math.exp(Math.log(de) + (Math.log(ate) - Math.log(de)) * e) : de + (ate - de) * e;
      el.textContent = f(t >= 1 ? ate : v);
      if (t < 1) requestAnimationFrame(q);
    }
    requestAnimationFrame(q);
  }

  /* Some com o confete restante (ao trocar de tela). */
  function limpar() { parts = []; }

  return { confete, chuva, contar, limpar, reduzir };
})();
