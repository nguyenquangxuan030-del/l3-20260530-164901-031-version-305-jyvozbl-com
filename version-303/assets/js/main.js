(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function norm(value) {
    return String(value || '').toLowerCase().trim();
  }

  function safe(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var menuButton = $('[data-menu-toggle]');
  var mobileNav = $('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var searchPanel = $('#searchPanel');
  var searchInput = $('#globalSearchInput');
  var searchResults = $('#globalSearchResults');
  var openButtons = $all('[data-open-search]');
  var closeButton = $('[data-close-search]');

  function renderGlobalSearch() {
    if (!searchInput || !searchResults || !Array.isArray(window.siteMovieIndex || siteMovieIndex)) {
      return;
    }
    var keyword = norm(searchInput.value);
    var data = window.siteMovieIndex || siteMovieIndex;
    var results = [];
    if (keyword.length > 0) {
      for (var i = 0; i < data.length; i += 1) {
        var item = data[i];
        var hay = norm([item.title, item.year, item.type, item.region, item.genre, (item.tags || []).join(' '), item.desc].join(' '));
        if (hay.indexOf(keyword) !== -1) {
          results.push(item);
        }
        if (results.length >= 18) {
          break;
        }
      }
    }
    if (!keyword) {
      searchResults.innerHTML = '<div class="filter-status">输入片名、题材、地区或年份开始搜索。</div>';
      return;
    }
    if (!results.length) {
      searchResults.innerHTML = '<div class="filter-status">未找到相关影片。</div>';
      return;
    }
    searchResults.innerHTML = results.map(function (item) {
      return '<a class="search-result" href="' + safe(item.url) + '">' +
        '<img src="' + safe(item.cover) + '" alt="' + safe(item.title) + '">' +
        '<span><strong>' + safe(item.title) + '</strong><span>' +
        safe([item.year, item.region, item.type, item.genre].filter(Boolean).join(' · ')) +
        '</span></span></a>';
    }).join('');
  }

  function openSearch() {
    if (!searchPanel) {
      return;
    }
    searchPanel.classList.add('is-open');
    searchPanel.setAttribute('aria-hidden', 'false');
    if (searchInput) {
      searchInput.focus();
      renderGlobalSearch();
    }
  }

  function closeSearch() {
    if (!searchPanel) {
      return;
    }
    searchPanel.classList.remove('is-open');
    searchPanel.setAttribute('aria-hidden', 'true');
  }

  openButtons.forEach(function (button) {
    button.addEventListener('click', openSearch);
  });
  if (closeButton) {
    closeButton.addEventListener('click', closeSearch);
  }
  if (searchInput) {
    searchInput.addEventListener('input', renderGlobalSearch);
  }
  if (searchPanel) {
    searchPanel.addEventListener('click', function (event) {
      if (event.target === searchPanel) {
        closeSearch();
      }
    });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSearch();
    }
  });

  var slides = $all('.hero-slide');
  var dots = $all('.hero-dot');
  var prev = $('[data-hero-prev]');
  var next = $('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    showSlide(0);
    startHero();
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startHero();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }
  }

  var pageFilter = $('[data-page-filter]');
  var yearFilter = $('[data-year-filter]');
  var typeFilter = $('[data-type-filter]');
  var cards = $all('.movie-card[data-title]');
  var status = $('[data-filter-status]');

  function applyPageFilter() {
    if (!cards.length) {
      return;
    }
    var keyword = norm(pageFilter ? pageFilter.value : '');
    var year = yearFilter ? yearFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';
    var visible = 0;
    cards.forEach(function (card) {
      var hay = norm([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year')
      ].join(' '));
      var ok = true;
      if (keyword && hay.indexOf(keyword) === -1) {
        ok = false;
      }
      if (year && card.getAttribute('data-year') !== year) {
        ok = false;
      }
      if (type && card.getAttribute('data-type') !== type) {
        ok = false;
      }
      card.classList.toggle('hidden-by-filter', !ok);
      if (ok) {
        visible += 1;
      }
    });
    if (status) {
      status.textContent = visible ? '当前显示 ' + visible + ' 部影片' : '当前条件下没有匹配影片';
    }
  }

  [pageFilter, yearFilter, typeFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyPageFilter);
      control.addEventListener('change', applyPageFilter);
    }
  });
  applyPageFilter();
})();
