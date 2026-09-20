const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const boot = document.getElementById('boot');
if (boot && !reduced) {
  requestAnimationFrame(() => setTimeout(() => boot.classList.add('is-done'), 760));
} else if (boot) {
  boot.remove();
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/* Scene visibility + HUD */
const scenes = [...document.querySelectorAll('.scene')];
const railItems = [...document.querySelectorAll('.scene-rail__item')];
const hudScene = document.getElementById('hudScene');
const progressBar = document.getElementById('progressBar');

const sceneObserver = new IntersectionObserver(entries => {
  const visible = entries
    .filter(e => e.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  const scene = visible.target;
  document.body.dataset.scene = scene.id;
  hudScene.textContent = scene.dataset.label || scene.id.toUpperCase();
  railItems.forEach(btn => btn.classList.toggle('is-active', btn.dataset.target === scene.id));
}, { threshold: [0.25, 0.45, 0.65] });

scenes.forEach(scene => sceneObserver.observe(scene));

railItems.forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.target)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });
});

addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? scrollY / max : 0;
  if (progressBar) progressBar.style.height = (p * 100) + '%';
}, { passive: true });

/* Reveals */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* Ambient canvas */
const ambient = document.getElementById('ambient');
const ctx = ambient?.getContext('2d');
let particles = [];

function resizeAmbient() {
  if (!ambient || !ctx) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  ambient.width = Math.floor(innerWidth * dpr);
  ambient.height = Math.floor(innerHeight * dpr);
  ambient.style.width = innerWidth + 'px';
  ambient.style.height = innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(72, Math.floor(innerWidth / 18));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - .5) * .11,
    vy: (Math.random() - .5) * .11,
    r: .35 + Math.random() * 1.05,
    a: .16 + Math.random() * .34
  }));
}
function drawAmbient() {
  if (!ambient || !ctx) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < -8) p.x = innerWidth + 8;
    if (p.x > innerWidth + 8) p.x = -8;
    if (p.y < -8) p.y = innerHeight + 8;
    if (p.y > innerHeight + 8) p.y = -8;
    ctx.fillStyle = `rgba(255,255,255,${p.a})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!reduced) requestAnimationFrame(drawAmbient);
}
resizeAmbient();
addEventListener('resize', resizeAmbient);
drawAmbient();

/* Pointer light + spatial parallax */
const cursorOrb = document.getElementById('cursorOrb');
let px = innerWidth / 2;
let py = innerHeight / 2;
let tx = px;
let ty = py;

addEventListener('pointermove', e => {
  tx = e.clientX;
  ty = e.clientY;
  if (cursorOrb) {
    cursorOrb.style.left = tx + 'px';
    cursorOrb.style.top = ty + 'px';
  }

  if (reduced || !matchMedia('(pointer:fine)').matches) return;
  const active = document.querySelector('.scene[id="' + document.body.dataset.scene + '"]');
  if (!active) return;
  const nx = (e.clientX / innerWidth - .5);
  const ny = (e.clientY / innerHeight - .5);
  active.querySelectorAll('[data-depth]').forEach(el => {
    const depth = Number(el.dataset.depth || .2);
    el.style.translate = `${nx * depth * 28}px ${ny * depth * 22}px`;
  });
});

/* Magnetic interactions */
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('pointermove', e => {
    if (reduced || !matchMedia('(pointer:fine)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * .1;
    const y = (e.clientY - r.top - r.height / 2) * .1;
    el.style.transform = `translate(${x}px,${y}px)`;
  });
  el.addEventListener('pointerleave', () => el.style.transform = '');
});

/* Project deck */
const deckProjects = {
  gold: {
    caseNo: '01',
    state: 'PRIVATE ALPHA',
    kicker: 'GOVERNED TRADING OPERATIONS',
    title: 'Gold Ops OS',
    summary: 'Governed XAUUSD trading-operations platform with explicit human authorization, security gates, broker-secret custody, and evidence-driven release checks.',
    role: 'Founder · AI-Assisted Product & Workflow Builder',
    proof: '836/836 Vitest · 782 database tests',
    stack: ['Supabase', 'Vercel', 'Vitest', 'Product Ops'],
    serial: 'MJ / SYS-01 / 2026',
    accent: '#f2ca52'
  },
  aspirva: {
    caseNo: '02',
    state: 'PRE-RELEASE WINDOWS',
    kicker: 'CAREER OPERATING SYSTEM',
    title: 'Aspirva',
    summary: 'Local-first career operating system combining job discovery, candidate intelligence, structured job analysis, résumé workflows, interview support, and human-controlled career decisions.',
    role: 'Product Owner · AI-Assisted Builder',
    proof: '310 automated tests passing · runtime launch proven',
    stack: ['Windows', 'AI Workflows', 'QA', 'Release Readiness'],
    serial: 'MJ / SYS-02 / 2026',
    accent: '#1ea3b0'
  },
  growth: {
    caseNo: '03',
    state: 'CREATOR INTELLIGENCE',
    kicker: 'EVIDENCE-DRIVEN CHANNEL OPERATOR',
    title: 'PuddleLoom Growth OS',
    summary: 'Evidence-driven YouTube operating loop: observe, diagnose, hypothesize, experiment, decide, execute, measure, and learn — with owner-control, monetization, and authenticity boundaries.',
    role: 'Product Owner · AI Workflow Designer',
    proof: '257/257 tests passing at R3 checkpoint',
    stack: ['YouTube APIs', 'Turso', 'Azure', 'AI Gateway'],
    serial: 'MJ / SYS-03 / 2026',
    accent: '#7ef7ee'
  },
  studio: {
    caseNo: '04',
    state: 'MEDIA AUTOMATION',
    kicker: 'LOCAL-FIRST CREATOR PRODUCTION',
    title: 'PuddleLoom Studio',
    summary: 'Portable local-first production system for repetitive media workflows, rendering, diagnostics, provider boundaries, and creator automation built around FFmpeg and modern web and Android tooling.',
    role: 'Workflow / Automation Builder',
    proof: 'Local production workflow · 60 FPS rendering direction',
    stack: ['FFmpeg', 'TypeScript', 'Local-first', 'Automation'],
    serial: 'MJ / SYS-04 / 2026',
    accent: '#b9f43b'
  }
};

const deck = document.getElementById('projectDeck');
const deckCards = deck ? [...deck.querySelectorAll('.project-card')] : [];
let deckOrder = deckCards.map((_, i) => i);
let deckHasShuffled = false;

function deckPositions() {
  const mobile = innerWidth < 650;
  return mobile ? [
    { x: 0, y: -6, r: -1.1, s: 1, z: 10 },
    { x: 20, y: 14, r: 4.7, s: .965, z: 9 },
    { x: -18, y: 25, r: -5.8, s: .93, z: 8 },
    { x: 12, y: 37, r: 8.2, s: .9, z: 7 }
  ] : [
    { x: 0, y: -8, r: -1.2, s: 1, z: 10 },
    { x: 34, y: 16, r: 5.7, s: .963, z: 9 },
    { x: -31, y: 29, r: -7.1, s: .925, z: 8 },
    { x: 20, y: 45, r: 10.2, s: .888, z: 7 }
  ];
}

function renderDeck(stagger = false) {
  const positions = deckPositions();
  deckCards.forEach((card, index) => {
    const depth = deckOrder.indexOf(index);
    const p = positions[depth] || positions.at(-1);
    card.classList.toggle('is-active', depth === 0);
    card.style.transitionDelay = stagger ? (depth * 55) + 'ms' : '0ms';
    card.style.setProperty('--dx', p.x + 'px');
    card.style.setProperty('--dy', p.y + 'px');
    card.style.setProperty('--rot', p.r + 'deg');
    card.style.setProperty('--scale', p.s);
    card.style.setProperty('--z', p.z);
    card.setAttribute('aria-pressed', depth === 0 ? 'true' : 'false');
  });
  if (stagger) setTimeout(() => deckCards.forEach(card => card.style.transitionDelay = '0ms'), 780);
}

function animateSwap(el, text) {
  if (!el) return;
  if (!reduced) {
    el.animate(
      [{ opacity: .2, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 330, easing: 'cubic-bezier(.16,1,.3,1)' }
    );
  }
  el.textContent = text;
}

function showDossier(key) {
  const p = deckProjects[key];
  if (!p) return;
  const dossier = document.getElementById('projectDossier');
  dossier?.style.setProperty('--dossier-accent', p.accent);
  animateSwap(document.getElementById('dossierCase'), 'CASE FILE / ' + p.caseNo);
  animateSwap(document.getElementById('dossierState'), p.state);
  animateSwap(document.getElementById('dossierKicker'), p.kicker);
  animateSwap(document.getElementById('dossierTitle'), p.title);
  animateSwap(document.getElementById('dossierSummary'), p.summary);
  animateSwap(document.getElementById('dossierRole'), p.role);
  animateSwap(document.getElementById('dossierProof'), p.proof);
  animateSwap(document.getElementById('dossierSerial'), p.serial);
  const stack = document.getElementById('dossierStack');
  if (stack) {
    stack.innerHTML = p.stack.map(item => '<span>' + item + '</span>').join('');
    if (!reduced) {
      [...stack.children].forEach((el, i) => el.animate(
        [{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 300, delay: i * 35, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }
      ));
    }
  }
}

function bringToFront(index) {
  if (deckOrder[0] === index) return;
  const card = deckCards[index];
  if (!reduced) {
    card.animate(
      [
        { transform: getComputedStyle(card).transform },
        { transform: 'translate(-50%,-50%) translate(0px,-58px) rotate(0deg) scale(1.025)' }
      ],
      { duration: 240, easing: 'cubic-bezier(.2,.85,.2,1)' }
    );
  }
  setTimeout(() => {
    deckOrder = deckOrder.filter(i => i !== index);
    deckOrder.unshift(index);
    renderDeck(true);
    showDossier(card.dataset.project);
  }, reduced ? 0 : 105);
}

function shuffleProjectDeck() {
  if (!deck || deck.classList.contains('is-shuffling')) return;
  deck.classList.add('is-shuffling');
  const button = document.getElementById('shuffleDeck');
  if (button) button.disabled = true;

  deckCards.forEach((card, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    const spread = (innerWidth < 650 ? 95 : 150) + i * 21;
    card.style.transitionDelay = (i * 30) + 'ms';
    card.style.setProperty('--dx', (dir * spread) + 'px');
    card.style.setProperty('--dy', (-36 + i * 19) + 'px');
    card.style.setProperty('--rot', (dir * (14 + i * 2.2)) + 'deg');
    card.style.setProperty('--scale', '.94');
  });

  setTimeout(() => {
    for (let i = deckOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deckOrder[i], deckOrder[j]] = [deckOrder[j], deckOrder[i]];
    }
    renderDeck(true);
    showDossier(deckCards[deckOrder[0]].dataset.project);
  }, 350);

  setTimeout(() => {
    deck.classList.remove('is-shuffling');
    deckCards.forEach(card => card.style.transitionDelay = '0ms');
    if (button) button.disabled = false;
  }, 1050);
}

deckCards.forEach((card, index) => card.addEventListener('click', () => bringToFront(index)));
document.getElementById('shuffleDeck')?.addEventListener('click', shuffleProjectDeck);
document.getElementById('nextProject')?.addEventListener('click', () => {
  const first = deckOrder.shift();
  deckOrder.push(first);
  renderDeck(true);
  showDossier(deckCards[deckOrder[0]].dataset.project);
});
renderDeck();
addEventListener('resize', () => renderDeck());

if (deck) {
  const autoShuffleObserver = new IntersectionObserver(entries => {
    if (!deckHasShuffled && entries.some(e => e.isIntersecting)) {
      deckHasShuffled = true;
      autoShuffleObserver.disconnect();
      if (!reduced) setTimeout(shuffleProjectDeck, 600);
    }
  }, { threshold: .35 });
  autoShuffleObserver.observe(deck);
}

/* Method map */
const methodData = {
  frame: {
    no: '01 / FRAME',
    title: 'Make the desired behavior explicit.',
    copy: 'Define the problem, boundaries, evidence required, and what must remain under human control before implementation begins.'
  },
  direct: {
    no: '02 / DIRECT',
    title: 'Convert intent into bounded missions.',
    copy: 'Give agents a narrow job, explicit constraints, source-of-truth rules, acceptance criteria, and a clear stop condition.'
  },
  verify: {
    no: '03 / VERIFY',
    title: 'Evidence outranks confidence.',
    copy: 'Run tests, inspect the real output, compare it with the intended behavior, and reject completion claims that are not supported by evidence.'
  },
  ship: {
    no: '04 / SHIP',
    title: 'Release only through a visible gate.',
    copy: 'Keep consequential actions, production changes, and irreversible decisions behind deliberate authorization and auditable checkpoints.'
  }
};

const methodNodes = [...document.querySelectorAll('.system-node')];
methodNodes.forEach(node => {
  const activate = () => {
    methodNodes.forEach(n => n.classList.toggle('is-active', n === node));
    const data = methodData[node.dataset.step];
    animateSwap(document.getElementById('systemDetailNo'), data.no);
    animateSwap(document.getElementById('systemDetailTitle'), data.title);
    animateSwap(document.getElementById('systemDetailCopy'), data.copy);
  };
  node.addEventListener('click', activate);
  node.addEventListener('pointerenter', activate);
});

/* Counters */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting || entry.target.dataset.done) return;
    entry.target.dataset.done = '1';
    const end = Number(entry.target.dataset.count);
    if (reduced) {
      entry.target.textContent = end;
      return;
    }
    const start = performance.now();
    const duration = 1350;
    const tick = now => {
      const p = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      entry.target.textContent = Math.round(end * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: .5 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* Subtle scroll-responsive hero scale */
if (!reduced) {
  addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-title');
    if (!hero || scrollY > innerHeight * 1.1) return;
    const p = clamp(scrollY / innerHeight, 0, 1);
    hero.style.opacity = String(1 - p * .35);
    hero.style.transform = `translateY(${p * 30}px) scale(${1 - p * .025})`;
  }, { passive: true });
}
