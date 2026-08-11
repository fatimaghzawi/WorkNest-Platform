(() => {
  const TOTAL_SECONDS = 15 * 60;

  const stage = document.getElementById('stage');
  const slides = Array.from(stage.querySelectorAll('.scene'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const slideIndexEl = document.getElementById('slideIndex');
  const slideTotalEl = document.getElementById('slideTotal');
  const progressBar = document.getElementById('progressBar');
  const dots = document.getElementById('dots');
  const timerBtn = document.getElementById('timerBtn');
  const timerValue = document.getElementById('timerValue');
  const demoFrame = document.getElementById('demoFrame');
  const actLabel = document.getElementById('actLabel');

  let index = 0;
  let remaining = TOTAL_SECONDS;
  let timerId = null;

  slideTotalEl.textContent = String(slides.length);

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to scene ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dots.appendChild(dot);
  });

  const dotButtons = Array.from(dots.querySelectorAll('button'));

  function reloadDemoIfNeeded(i) {
    if (!demoFrame) return;
    if (slides[i].hasAttribute('data-demo-slide')) {
      const src = './demo/demo.html';
      if (demoFrame.getAttribute('src') !== src) demoFrame.setAttribute('src', src);
      else demoFrame.contentWindow?.location.reload();
    }
  }

  function goTo(next) {
    index = Math.max(0, Math.min(slides.length - 1, next));
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dotButtons.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    slideIndexEl.textContent = String(index + 1);
    progressBar.style.width = `${((index + 1) / slides.length) * 100}%`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === slides.length - 1;
    const section = slides[index].dataset.section || '';
    const act = slides[index].dataset.act || '';
    if (actLabel) actLabel.textContent = act || 'WorkNest';
    document.title = section ? `WorkNest — ${section}` : 'WorkNest — The Hire That Held';
    reloadDemoIfNeeded(index);
  }

  function formatTime(total) {
    const m = Math.floor(Math.abs(total) / 60);
    const s = Math.abs(total) % 60;
    const sign = total < 0 ? '-' : '';
    return `${sign}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function renderTimer() {
    timerValue.textContent = formatTime(remaining);
    timerBtn.classList.toggle('is-warn', remaining <= 180 && remaining > 0);
    timerBtn.classList.toggle('is-over', remaining <= 0);
  }

  function tick() {
    remaining -= 1;
    renderTimer();
  }

  function toggleTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
      timerBtn.classList.remove('is-running');
      return;
    }
    timerBtn.classList.add('is-running');
    timerId = setInterval(tick, 1000);
  }

  function resetTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    remaining = TOTAL_SECONDS;
    timerBtn.classList.remove('is-running', 'is-warn', 'is-over');
    renderTimer();
  }

  function onDemoSlide() {
    return slides[index].hasAttribute('data-demo-slide');
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));
  timerBtn.addEventListener('click', toggleTimer);
  timerBtn.addEventListener('dblclick', (event) => {
    event.preventDefault();
    resetTimer();
  });

  window.addEventListener('keydown', (event) => {
    const tag = (event.target && event.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (event.key === ' ' && onDemoSlide()) return;

    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === ' ') {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === 'Home') {
      goTo(0);
    } else if (event.key === 'End') {
      goTo(slides.length - 1);
    } else if (event.key.toLowerCase() === 'f') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    } else if (event.key.toLowerCase() === 't') {
      toggleTimer();
    } else if (event.key.toLowerCase() === 'r' && event.shiftKey) {
      resetTimer();
    }
  });

  let touchStartX = 0;
  stage.addEventListener(
    'touchstart',
    (event) => {
      touchStartX = event.changedTouches[0].screenX;
    },
    { passive: true }
  );
  stage.addEventListener(
    'touchend',
    (event) => {
      const dx = event.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) < 50) return;
      if (dx < 0) goTo(index + 1);
      else goTo(index - 1);
    },
    { passive: true }
  );

  goTo(0);
  renderTimer();
  stage.focus();
})();
