(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach((hero) => {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const setActive = (nextIndex) => {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => setActive(index + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener('click', () => {
        setActive(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        setActive(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        setActive(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    setActive(0);
    start();
  });

  const queryInputs = Array.from(document.querySelectorAll('[data-filter-input]'));
  const cards = Array.from(document.querySelectorAll('[data-card]'));

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const applyFilter = (value) => {
    const keyword = normalize(value);

    cards.forEach((card) => {
      const haystack = normalize(`${card.dataset.title || ''} ${card.dataset.tags || ''} ${card.textContent || ''}`);
      card.classList.toggle('is-hidden', keyword !== '' && !haystack.includes(keyword));
    });
  };

  if (queryInputs.length && cards.length) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';

    queryInputs.forEach((input) => {
      if (input.hasAttribute('data-query-sync')) {
        input.value = q;
      }

      input.addEventListener('input', () => applyFilter(input.value));
    });

    if (q) {
      applyFilter(q);
    }
  }

  const video = document.querySelector('[data-video-player]');
  const playButton = document.querySelector('[data-play-button]');

  if (video && playButton) {
    const source = video.getAttribute('data-stream');
    let prepared = false;
    let hlsInstance = null;

    const prepareVideo = () => {
      if (prepared || !source) {
        return;
      }

      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    const playVideo = () => {
      prepareVideo();
      video.controls = true;
      playButton.classList.add('is-hidden');

      const result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          playButton.classList.remove('is-hidden');
        });
      }
    };

    playButton.addEventListener('click', playVideo);
    video.addEventListener('click', () => {
      if (!prepared || video.paused) {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
