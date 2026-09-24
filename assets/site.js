/* Dependency-free interactions for a static, mobile-first portfolio. */
(() => {
  const root = document.documentElement;
  const menu = document.getElementById('primary-nav');
  const menuToggle = document.getElementById('menu-toggle');
  const themeToggle = document.getElementById('theme-toggle');
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const destination = 'markjay.lisay@gmail.com';

  // Color theme: dark by default, with a persistent light alternative.
  function updateThemeButton() {
    const light = root.dataset.theme === 'light';
    themeToggle.setAttribute('aria-pressed', String(light));
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f8fafc' : '#0f172a');
  }
  updateThemeButton();
  themeToggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('mj-theme', next); } catch (_) {}
    updateThemeButton();
  });

  // Accessible mobile navigation.
  function setMenu(open) {
    menu.dataset.open = String(open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  }
  menuToggle.addEventListener('click', () => setMenu(menu.dataset.open !== 'true'));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.dataset.open === 'true') { setMenu(false); menuToggle.focus(); }
  });
  document.addEventListener('click', event => {
    if (menu.dataset.open === 'true' && !menu.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false);
  });

  // Keep all content visible by default. No scroll-driven animation loops on mobile or desktop.

  // Nav active state using observed sections, never scroll event loops.
  const navigationLinks = [...menu.querySelectorAll('a')];
  const sections = ['top','about','skills','projects','approach','experience','contact'].map(id => document.getElementById(id));
  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navigationLinks.forEach(link => {
        const active = link.hash === '#' + visible.target.id;
        link.classList.toggle('is-current', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-80px 0px -52% 0px', threshold: 0 });
    sections.forEach(section => section && activeObserver.observe(section));
  }

  // On a static site, prepare an email instead of claiming the message was sent.
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    if (!name || !email || !message) { status.textContent = 'Please fill in all three fields.'; return; }
    const subject = `Portfolio inquiry from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}\n\n- Sent via an email app from Mark Jay Lisay's portfolio.`;
    const href = `mailto:${destination}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Your email app should open with the message ready to send. If it does not, use the copy option below.';
    window.location.href = href;
  });

  const copyButton = document.getElementById('copy-email');
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(destination);
      copyButton.textContent = 'Copied: ' + destination;
      status.textContent = 'Email address copied.';
    } catch (_) {
      copyButton.textContent = destination;
      status.textContent = 'Copy the email address shown below the form.';
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
