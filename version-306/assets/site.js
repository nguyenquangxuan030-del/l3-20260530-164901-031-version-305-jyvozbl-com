(function () {
  var menuButton = document.querySelector('[data-mobile-menu]');
  var mainNav = document.querySelector('[data-main-nav]');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
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

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startAutoPlay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startAutoPlay();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startAutoPlay();
      });
    });

    hero.addEventListener('mouseenter', stopAutoPlay);
    hero.addEventListener('mouseleave', startAutoPlay);
    showSlide(0);
    startAutoPlay();
  }

  var input = document.querySelector('[data-search-input]');
  var clear = document.querySelector('[data-clear-search]');
  var count = document.querySelector('[data-search-count]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function updateFilter() {
    if (!input || !cards.length) {
      return;
    }
    var keyword = input.value.trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.classList.toggle('is-filtered-out', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = keyword ? '已筛选出 ' + visible + ' 条匹配内容。' : '当前页面共 ' + cards.length + ' 条内容，输入关键词即可筛选。';
    }
  }

  if (input) {
    input.addEventListener('input', updateFilter);
    updateFilter();
  }

  if (clear && input) {
    clear.addEventListener('click', function () {
      input.value = '';
      updateFilter();
      input.focus();
    });
  }
})();
