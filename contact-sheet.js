// Sends contact form data to Google Sheets via Apps Script.
// Paste your Web app URL below (ends with /exec).
const SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwOj8MCLUO_q9YFlfMRbTt4AUqSsuyFSf7NP3-9m4PginwKqll9U-HbaSjCoG9Qo4P9/exec';

(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const msg = document.getElementById('formMsg');
  const btn = form.querySelector('button[type="submit"]');

  function show(text, ok) {
    msg.textContent = text;
    msg.style.display = 'block';
    msg.style.opacity = '1';
    msg.style.visibility = 'visible';
    msg.style.color = ok ? '#4ade80' : '#f87171';
  }

  // Capture phase: runs before any older handler in script.js and replaces it.
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();
    const website = form.querySelector('#website') ? form.querySelector('#website').value : '';

    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      show('⚠️ Please fill in your name, a valid email and a message.', false);
      return;
    }
    if (SHEET_WEBAPP_URL.indexOf('PASTE_') === 0) {
      show('⚠️ Form is not connected yet (Web app URL missing).', false);
      return;
    }

    btn.disabled = true;
    const oldLabel = btn.textContent;
    btn.textContent = 'Sending...';
    try {
      await fetch(SHEET_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors', // Apps Script doesn't send CORS headers; response is opaque
        body: new URLSearchParams({ name, email, message, website })
      });
      show('✅ Message sent! I\'ll get back to you soon.', true);
      form.reset();
    } catch (err) {
      show('❌ Could not send. Please try again or email me directly.', false);
    } finally {
      btn.disabled = false;
      btn.textContent = oldLabel;
    }
  }, true);
})();