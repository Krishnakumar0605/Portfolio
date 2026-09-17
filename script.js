/* =========================================================
   script.js
   Single shared script for index.html, project.html,
   achievements.html and contact.html.
   Every function checks for the elements it needs first,
   so it's safe to include this same file on every page.
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initActiveNav();
  initTypewriter();
  initCarousels();
  initScrollReveal();
  initContactForm();
  initLightbox();
});

/* ===================== Active Nav Highlight ===================== */
function initActiveNav() {
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar a').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });
}

/* ===================== Typewriter (index.html) ===================== */
function initTypewriter() {
  const target = document.getElementById('typewriter');
  if (!target) return;

  const phrases = [
    'Full Stack Web Developer',
    'HTML & CSS Enthusiast',
    'JavaScript Learner',
    'Strong Learner'
  ];
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = phrases[phraseIdx];
    if (!deleting) {
      target.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      target.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }
    setTimeout(type, deleting ? 60 : 100);
  }
  type();
}

/* ===================== Image Carousel (project.html / achievements.html) ===================== */
function initCarousels() {
  const wrappers = document.querySelectorAll('.card-img-wrapper');
  if (!wrappers.length) return;

  wrappers.forEach(wrapper => {
    const firstImg = wrapper.querySelector('img');
    if (!firstImg) return; // e.g. a .pdf-thumb wrapper, nothing to carousel

    const allImgs = [firstImg];
    const rawImages = wrapper.dataset.images;

    if (rawImages) {
      rawImages
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .slice(1)
        .forEach(src => {
          const img = document.createElement('img');
          img.src = src;
          img.alt = firstImg.alt;
          // Carry over lightbox metadata / classes so extra slides stay zoomable
          img.className = firstImg.className;
          Object.assign(img.dataset, firstImg.dataset);
          img.dataset.full = src;
          const nextBtn = wrapper.querySelector('.carousel-btn.next');
          wrapper.insertBefore(img, nextBtn);
          allImgs.push(img);
        });
    }

    if (allImgs.length <= 1) {
      wrapper.classList.add('single');
      buildDots(wrapper, allImgs, 0);
      return;
    }

    let current = 0;

    function showImg(idx) {
      allImgs.forEach((img, i) => img.classList.toggle('active-img', i === idx));
      updateDots(wrapper, idx);
      current = idx;
    }

    const prevBtn = wrapper.querySelector('.prev');
    const nextBtn = wrapper.querySelector('.next');
    if (prevBtn) prevBtn.addEventListener('click', () => showImg((current - 1 + allImgs.length) % allImgs.length));
    if (nextBtn) nextBtn.addEventListener('click', () => showImg((current + 1) % allImgs.length));

    buildDots(wrapper, allImgs, 0);

    let startX = 0;
    wrapper.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    wrapper.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        showImg(diff > 0 ? (current + 1) % allImgs.length : (current - 1 + allImgs.length) % allImgs.length);
      }
    });
  });
}

function buildDots(wrapper, imgs, currentIdx) {
  const card = wrapper.closest('.card');
  if (!card) return;
  const dotsContainer = card.querySelector('.carousel-dots');
  if (!dotsContainer || imgs.length <= 1) return;

  imgs.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (i === currentIdx) dot.classList.add('active-dot');
    dot.addEventListener('click', () => {
      const allImgEls = [...wrapper.querySelectorAll('img')];
      allImgEls.forEach((img, j) => img.classList.toggle('active-img', j === i));
      updateDots(wrapper, i);
    });
    dotsContainer.appendChild(dot);
  });
}

function updateDots(wrapper, idx) {
  const card = wrapper.closest('.card');
  if (!card) return;
  card.querySelectorAll('.dot').forEach((dot, i) => dot.classList.toggle('active-dot', i === idx));
}

/* ===================== Scroll Reveal ===================== */
function initScrollReveal() {
  const cards = document.querySelectorAll('.card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  cards.forEach(card => observer.observe(card));
}

/* ===================== Contact Form (contact.html) ===================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  if (!form || !formMsg) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      formMsg.style.color = '#ff6b6b';
      formMsg.textContent = '⚠️ Please fill in all fields.';
      formMsg.style.display = 'block';
      return;
    }

    /* --- EmailJS sending (uncomment when credentials are ready) ---
    emailjs.init('YOUR_PUBLIC_KEY');
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', { name, email, message })
      .then(() => showSuccess())
      .catch(err => {
        formMsg.style.color = '#ff6b6b';
        formMsg.textContent = '❌ Something went wrong. Please try again.';
        formMsg.style.display = 'block';
        console.error(err);
      });
    */

    showSuccess();
  });

  function showSuccess() {
    formMsg.style.color = '#00ffaa';
    formMsg.textContent = "✅ Message sent! I'll get back to you soon.";
    formMsg.style.display = 'block';
    form.reset();
    setTimeout(() => { formMsg.style.display = 'none'; }, 5000);
  }
}

/* ===================== Certificate / Image Lightbox =====================
   Any element with class "cert-trigger" and a "data-full" attribute
   becomes clickable. Clicking it opens a full-screen viewer instead of
   navigating away. Supports:
     - click-to-zoom, mouse wheel zoom, pinch-to-zoom
     - drag / touch panning while zoomed in
     - keyboard (Esc, ← →)
     - prev/next navigation between items sharing the same data-gallery
     - image certificates AND PDF certificates (via data-type="pdf")
========================================================================= */
function initLightbox() {
  const cards = document.querySelectorAll('.card');
  const galleries = {};
  let hasTrigger = false;

  cards.forEach(card => {
    const trigger = card.querySelector('.cert-trigger[data-full]');
    if (!trigger) return;
    hasTrigger = true;

    const galleryName = trigger.dataset.gallery || 'default';
    if (!galleries[galleryName]) galleries[galleryName] = [];
    galleries[galleryName].push({
      full: trigger.dataset.full,
      title: trigger.dataset.title || '',
      desc: trigger.dataset.desc || '',
      type: trigger.dataset.type || 'image',
      cardEl: card
    });
  });

  if (!hasTrigger) return;

  /* ---- Build modal markup once ---- */
  const modal = document.createElement('div');
  modal.className = 'lightbox-overlay';
  modal.innerHTML = `
    <div class="lightbox-toolbar">
      <span class="lightbox-title"></span>
      <div class="lightbox-controls">
        <button type="button" class="lb-btn lb-zoom-out" title="Zoom out">−</button>
        <span class="lb-zoom-level">100%</span>
        <button type="button" class="lb-btn lb-zoom-in" title="Zoom in">+</button>
        <button type="button" class="lb-btn lb-reset" title="Reset zoom">⤾</button>
        <a class="lb-btn lb-download" title="Open original" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i></a>
        <button type="button" class="lb-btn lb-close" title="Close">&times;</button>
      </div>
    </div>
    <button type="button" class="lightbox-nav lightbox-prev" aria-label="Previous">&#8249;</button>
    <div class="lightbox-stage"></div>
    <button type="button" class="lightbox-nav lightbox-next" aria-label="Next">&#8250;</button>
    <div class="lightbox-caption"></div>
  `;
  document.body.appendChild(modal);

  const stage = modal.querySelector('.lightbox-stage');
  const titleEl = modal.querySelector('.lightbox-title');
  const captionEl = modal.querySelector('.lightbox-caption');
  const zoomLevel = modal.querySelector('.lb-zoom-level');
  const downloadLink = modal.querySelector('.lb-download');
  const prevBtn = modal.querySelector('.lightbox-prev');
  const nextBtn = modal.querySelector('.lightbox-next');

  let currentGallery = null;
  let currentIndex = 0;
  let scale = 1, translateX = 0, translateY = 0;
  let isDragging = false, startX = 0, startY = 0;
  let activeImg = null;
  let lastTouchDist = null;

  function applyTransform() {
    if (!activeImg) return;
    activeImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    activeImg.classList.toggle('zoomed', scale > 1);
    zoomLevel.textContent = Math.round(scale * 100) + '%';
  }

  function setScale(newScale) {
    scale = Math.min(5, Math.max(1, newScale));
    if (scale === 1) { translateX = 0; translateY = 0; }
    applyTransform();
  }

  function attachImageInteractions(img) {
    img.addEventListener('click', () => {
      if (isDragging) return;
      setScale(scale === 1 ? 2 : 1);
    });

    img.addEventListener('wheel', (e) => {
      e.preventDefault();
      setScale(scale + (e.deltaY > 0 ? -0.2 : 0.2));
    }, { passive: false });

    img.addEventListener('mousedown', (e) => {
      if (scale <= 1) return;
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      img.classList.add('dragging');
    });

    img.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1 && scale > 1) {
        isDragging = true;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
      } else if (e.touches.length === 2) {
        lastTouchDist = getTouchDist(e.touches);
      }
    }, { passive: true });

    img.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && isDragging) {
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;
        applyTransform();
      } else if (e.touches.length === 2) {
        const dist = getTouchDist(e.touches);
        if (lastTouchDist) setScale(scale + (dist - lastTouchDist) * 0.01);
        lastTouchDist = dist;
      }
    }, { passive: true });

    img.addEventListener('touchend', () => {
      isDragging = false;
      lastTouchDist = null;
    });
  }

  function getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  window.addEventListener('mousemove', (e) => {
    if (!isDragging || !activeImg) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    if (activeImg) activeImg.classList.remove('dragging');
  });

  function render() {
    const item = galleries[currentGallery][currentIndex];
    scale = 1; translateX = 0; translateY = 0;
    activeImg = null;
    stage.innerHTML = '';

    modal.classList.toggle('pdf-mode', item.type === 'pdf');

    if (item.type === 'pdf') {
      const frame = document.createElement('iframe');
      frame.className = 'lightbox-pdf';
      frame.src = item.full;
      stage.appendChild(frame);
    } else {
      const img = document.createElement('img');
      img.src = item.full;
      img.alt = item.title;
      img.className = 'lightbox-img';
      stage.appendChild(img);
      activeImg = img;
      attachImageInteractions(img);
      applyTransform();
    }

    titleEl.textContent = item.title;
    captionEl.textContent = item.desc;
    captionEl.style.display = item.desc ? 'block' : 'none';
    downloadLink.href = item.full;
    zoomLevel.textContent = '100%';

    const multi = galleries[currentGallery].length > 1;
    prevBtn.style.display = multi ? 'flex' : 'none';
    nextBtn.style.display = multi ? 'flex' : 'none';
  }

  function openAt(galleryName, index) {
    currentGallery = galleryName;
    currentIndex = index;
    render();
    modal.classList.add('open');
    document.body.classList.add('lightbox-lock');
  }

  function close() {
    modal.classList.remove('open');
    document.body.classList.remove('lightbox-lock');
    stage.innerHTML = '';
    activeImg = null;
  }

  function next() {
    const list = galleries[currentGallery];
    currentIndex = (currentIndex + 1) % list.length;
    render();
  }

  function prev() {
    const list = galleries[currentGallery];
    currentIndex = (currentIndex - 1 + list.length) % list.length;
    render();
  }

  /* ---- Wire up every trigger on the page ---- */
  Object.keys(galleries).forEach(galleryName => {
    galleries[galleryName].forEach((item, idx) => {
      item.cardEl.querySelectorAll('.cert-trigger').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          openAt(galleryName, idx);
        });
      });
    });
  });

  modal.querySelector('.lb-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  modal.querySelector('.lb-zoom-in').addEventListener('click', () => setScale(scale + 0.25));
  modal.querySelector('.lb-zoom-out').addEventListener('click', () => setScale(scale - 0.25));
  modal.querySelector('.lb-reset').addEventListener('click', () => setScale(1));

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
}
