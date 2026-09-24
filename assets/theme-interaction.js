/* Accessible visitor evidence selector and portfolio case-study controls. */
(() => {
  const focusCases = {
    automation: { kicker:'DOCUMENTED OPERATIONS RESULT',title:'5+ hours returned to one complex reconciliation case.',description:'I automated qualifying member-payment matches with Excel VBA, preserving human review for exceptions while reducing repetitive processing.',metric:'5+ hours saved',context:'One super-complex case, as documented in my résumé.',href:'#results',link:'See the reconciliation case' },
    ai: { kicker:'GOVERNED PROJECT · PRIVATE ALPHA',title:'AI-assisted work with human authorization built in.',description:'Gold Ops OS uses explicit safety gates, broker-secret boundaries and evidence-led reviews. It is not an autonomous trading bot.',metric:'836/836 Vitest',context:'Passing at the documented certification checkpoint, including 782 database tests.',href:'#project-gold-title',link:'Explore Gold Ops OS' },
    product: { kicker:'WINDOWS PRODUCT · PRE-RELEASE',title:'Structured delivery with tests before launch.',description:'Aspirva connects job discovery, résumé workflows and interview preparation. Its Windows lineage is undergoing release-stage validation.',metric:'310 tests',context:'Passing in the audited Windows development lineage; Store certification remains pending.',href:'#project-aspirva-title',link:'Explore Aspirva' },
    creator: { kicker:'WEB PWA · ACTIVE DEVELOPMENT',title:'One workspace for repetitive creator production.',description:'PuddleLoom Studio brings ambient rendering, narrated editing, captions, format conversion and Facebook branding into a local-first web experience.',metric:'9 tool routes',context:'Present in the feat/web-pwa-foundation branch; individual tools remain under development.',href:'#project-studio-title',link:'Explore PuddleLoom Studio' }
  };
  const focusTabs = [...document.querySelectorAll('.visitor-tab')];
  const focusPanel = document.getElementById('visitor-focus-panel');
  function chooseFocus(tab, moveFocus = false) {
    if (!tab || !focusPanel) return;
    const entry = focusCases[tab.dataset.focus];
    if (!entry) return;
    focusTabs.forEach(button => {
      const selected = button === tab;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    focusPanel.setAttribute('aria-labelledby', tab.id);
    document.getElementById('visitor-focus-kicker').textContent = entry.kicker;
    document.getElementById('visitor-focus-title').textContent = entry.title;
    document.getElementById('visitor-focus-description').textContent = entry.description;
    document.getElementById('visitor-focus-metric').textContent = entry.metric;
    document.getElementById('visitor-focus-context').textContent = entry.context;
    const link = document.getElementById('visitor-focus-link');
    link.href = entry.href;
    link.firstChild.textContent = entry.link + ' ';
    if (moveFocus) tab.focus();
  }
  focusTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => chooseFocus(tab));
    tab.addEventListener('keydown', event => {
      let next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % focusTabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + focusTabs.length) % focusTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = focusTabs.length - 1;
      if (next !== null) { event.preventDefault(); chooseFocus(focusTabs[next], true); }
    });
  });
  const cases = [...document.querySelectorAll('#projects .case-expand')];
  const casesToggle = document.getElementById('toggle-all-cases');
  function syncCasesToggle() {
    if (!casesToggle) return;
    const allOpen = cases.length > 0 && cases.every(item => item.open);
    casesToggle.setAttribute('aria-expanded', String(allOpen));
    casesToggle.firstChild.textContent = allOpen ? 'Collapse all case studies ' : 'Expand all case studies ';
    casesToggle.querySelector('span').textContent = allOpen ? '−' : '+';
  }
  if (casesToggle) {
    casesToggle.addEventListener('click', () => {
      const open = !cases.every(item => item.open);
      cases.forEach(item => { item.open = open; });
      syncCasesToggle();
    });
    cases.forEach(item => item.addEventListener('toggle', syncCasesToggle));
    syncCasesToggle();
  }
  const theme = document.getElementById('theme-toggle');
  const syncTitle = () => { if (theme) theme.title = document.documentElement.dataset.theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'; };
  syncTitle();
  theme?.addEventListener('click',syncTitle);
})();
