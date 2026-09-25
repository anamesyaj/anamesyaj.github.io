/* Dependency-free interactions for a static, mobile-first portfolio. */
(() => {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const destination = 'markjay.lisay@gmail.com';

  // App navigation and the dedicated sidebar / floating theme controls are
  // owned by app-navigation.js. This file handles contact interactions only.

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

  // The form also works for visitors whose phone has no configured mail app.
  // Copy the full prepared inquiry, rather than showing a non-working CTA.
  const copyMessage = document.getElementById('copy-message');
  const fallbackCopy = text => {
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.cssText = 'position:fixed;left:-9999px;opacity:0;';
    document.body.appendChild(input);
    input.select();
    let worked = false;
    try { worked = document.execCommand('copy'); } catch (_) {}
    input.remove();
    return worked;
  };
  copyMessage?.addEventListener('click', async () => {
    const name = document.getElementById('contact-name')?.value.trim() || '';
    const email = document.getElementById('contact-email')?.value.trim() || '';
    const message = document.getElementById('contact-message')?.value.trim() || '';
    if (!message) {
      status.textContent = 'Write a message first, then tap Copy prepared message.';
      document.getElementById('contact-message')?.focus();
      return;
    }
    const prepared = [
      name ? 'Name: ' + name : '',
      email ? 'Email: ' + email : '',
      '',
      message
    ].filter((line, i) => line || i > 1).join('\n').trim();
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(prepared);
        copied = true;
      }
    } catch (_) {}
    if (!copied) copied = fallbackCopy(prepared);
    if (copied) {
      copyMessage.textContent = 'Message copied ✓';
      status.textContent = 'Message copied. Paste it into your email app and send it to ' + destination + '.';
    } else {
      status.textContent = 'Copy is blocked by your browser. Select your message above and paste it into your email app.';
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
