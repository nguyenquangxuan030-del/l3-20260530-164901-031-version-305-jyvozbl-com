(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;
    var show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    var startTimer = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });
    show(0);
    startTimer();
  }

  var scope = document.querySelector('[data-search-scope]');
  if (scope) {
    var input = scope.querySelector('.filter-input');
    var select = scope.querySelector('.filter-select');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var query = new URLSearchParams(window.location.search).get('q');
    if (query && input) {
      input.value = query;
    }
    var runFilter = function () {
      var words = input ? input.value.trim().toLowerCase() : '';
      var year = select ? select.value : '';
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-keywords') || '').toLowerCase();
        var yearValue = card.getAttribute('data-year') || '';
        var matchedText = !words || haystack.indexOf(words) !== -1;
        var matchedYear = !year || yearValue.indexOf(year) !== -1;
        card.classList.toggle('is-hidden', !(matchedText && matchedYear));
      });
    };
    if (input) {
      input.addEventListener('input', runFilter);
    }
    if (select) {
      select.addEventListener('change', runFilter);
    }
    runFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var stream = shell.getAttribute('data-stream');
    var ready = false;
    var hlsInstance = null;
    var start = function () {
      if (!video || !stream) {
        return;
      }
      if (!ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        ready = true;
      }
      if (overlay) {
        overlay.classList.add('hidden');
      }
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    };
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          start();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  });
})();
