(() => {
  const video = document.getElementById('demoVideo');
  const playBtn = document.getElementById('playBtn');
  const track = document.getElementById('track');
  const fill = document.getElementById('fill');
  const timeLabel = document.getElementById('timeLabel');
  const fsBtn = document.getElementById('fsBtn');
  const reel = document.getElementById('reel');
  const captionRole = document.getElementById('captionRole');
  const captionTitle = document.getElementById('captionTitle');
  const captionBody = document.getElementById('captionBody');
  const captionChapter = document.getElementById('captionChapter');
  const missing = document.getElementById('missingVideo');
  const speedBtn = document.getElementById('speedBtn');

  const SPEED = 1;

  const fallbackChapters = [
    { at: 0, role: 'Both', title: 'Client ↔ Freelancer marketplace flow', body: 'Orange = Client · Teal = Freelancer' },
    { at: 5, role: 'Client', title: 'Client posts a new job', body: 'Title, brief, budget, skills, deadline' },
    { at: 25, role: 'Freelancer', title: 'Freelancer submits a proposal', body: 'Cover letter, price, timeline' },
    { at: 55, role: 'Client', title: 'Notification + proposal review', body: 'Bell alert → proposal → profile' },
    { at: 80, role: 'Sync', title: 'Interview & hire', body: 'Schedule → accept → escrow' },
    { at: 105, role: 'Sync', title: 'Shared workspace', body: 'Synced Kanban board' },
    { at: 130, role: 'Both', title: 'Files & collaboration', body: 'Shared attachments and deliverables' },
    { at: 155, role: 'Both', title: 'Delivery → payment', body: 'Accept delivery · wallet · payments' },
  ];

  let chapters = fallbackChapters;

  function fmt(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function chapterAt(t) {
    let idx = 0;
    for (let i = 0; i < chapters.length; i += 1) {
      if (chapters[i].at <= t) idx = i;
      else break;
    }
    return idx;
  }

  function syncCaption() {
    const t = video.currentTime || 0;
    const idx = chapterAt(t);
    const c = chapters[idx];
    if (!c) return;
    if (captionRole.dataset.key === `${c.at}:${c.title}`) return;
    captionRole.dataset.key = `${c.at}:${c.title}`;
    captionRole.textContent = c.role;
    captionTitle.textContent = c.title;
    captionBody.textContent = c.body;
    captionChapter.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`;
  }

  function syncBar() {
    const d = video.duration || 0;
    const t = video.currentTime || 0;
    fill.style.width = `${d ? (t / d) * 100 : 0}%`;
    timeLabel.textContent = `${fmt(t)} / ${fmt(d)} · ${video.playbackRate.toFixed(2).replace(/\.00$/, '')}x`;
    playBtn.textContent = video.paused ? '▶' : '❚❚';
    syncCaption();
  }

  let captionRaf = 0;
  function captionLoop() {
    syncCaption();
    syncBar();
    if (!video.paused && !video.ended) captionRaf = requestAnimationFrame(captionLoop);
  }

  function togglePlay() {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

  playBtn.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);
  video.addEventListener('timeupdate', syncBar);
  video.addEventListener('loadedmetadata', () => {
    video.playbackRate = SPEED;
    syncBar();
  });
  video.addEventListener('play', () => {
    cancelAnimationFrame(captionRaf);
    captionLoop();
  });
  video.addEventListener('pause', () => {
    cancelAnimationFrame(captionRaf);
    syncBar();
  });
  video.addEventListener('ended', () => {
    playBtn.textContent = '▶';
  });

  track.addEventListener('click', (e) => {
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    if (video.duration) video.currentTime = ratio * video.duration;
  });

  fsBtn.addEventListener('click', async () => {
    if (!document.fullscreenElement) await reel.requestFullscreen?.();
    else await document.exitFullscreen?.();
  });

  const speeds = [1, 1.25, 1.5, 2];
  let speedIdx = 0;
  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % speeds.length;
      video.playbackRate = speeds[speedIdx];
      speedBtn.textContent = `${speeds[speedIdx]}x`;
      syncBar();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    }
  });

  fetch('./assets/chapters.json')
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data?.chapters?.length) chapters = data.chapters;
      syncCaption();
    })
    .catch(() => syncCaption());

  video.addEventListener('error', () => {
    const code = video.error?.code;
    if (missing && (code === 2 || code === 3 || code === 4)) {
      missing.classList.add('is-visible');
    }
  });
  video.addEventListener('loadeddata', () => {
    missing?.classList.remove('is-visible');
  });

  video.playbackRate = SPEED;
  const tryPlay = () => video.play().catch(() => {});
  if (video.readyState >= 2) tryPlay();
  else video.addEventListener('canplay', tryPlay, { once: true });
  syncBar();
})();
