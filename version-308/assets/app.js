(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }
    play();
  }

  function textOf(card) {
    return [
      card.dataset.title || "",
      card.dataset.year || "",
      card.dataset.type || "",
      card.dataset.genre || "",
      card.dataset.category || "",
      card.textContent || ""
    ].join(" ").toLowerCase();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var root = panel.parentElement;
      if (!root) {
        return;
      }
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
      var search = panel.querySelector(".filter-search");
      var year = panel.querySelector(".filter-year");
      var type = panel.querySelector(".filter-type");
      var reset = panel.querySelector(".filter-reset");
      var empty = root.querySelector(".empty-state");
      function apply() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var ok = true;
          if (q && textOf(card).indexOf(q) === -1) {
            ok = false;
          }
          if (y && card.dataset.year !== y) {
            ok = false;
          }
          if (t && card.dataset.type !== t) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      [search, year, type].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      if (reset) {
        reset.addEventListener("click", function () {
          if (search) {
            search.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (type) {
            type.value = "";
          }
          apply();
        });
      }
    });
  }

  function initPlayer() {
    var shell = document.querySelector(".player-shell");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".play-cover");
    var source = shell.dataset.stream;
    var started = false;
    var hlsInstance = null;
    if (!video || !source) {
      return;
    }
    function bind() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function play() {
      bind();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }
    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 && cover) {
        cover.classList.remove("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
    var scrollBtn = document.querySelector("[data-scroll-player]");
    if (scrollBtn) {
      scrollBtn.addEventListener("click", function (event) {
        event.preventDefault();
        shell.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(play, 240);
      });
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
