(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");

  if (header && toggle) {
    toggle.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));

  if (slides.length > 1 && dots.length === slides.length) {
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = index % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5800);
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]")).forEach(function (scope) {
    var input = scope.querySelector(".search-input");
    var buttons = Array.prototype.slice.call(scope.querySelectorAll(".filter-pill"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var empty = scope.querySelector(".empty-state");
    var activeFilter = "";

    function valueOf(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-category"),
        card.getAttribute("data-type"),
        card.textContent
      ].join(" ").toLowerCase();
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = valueOf(card);
        var filterText = activeFilter.toLowerCase();
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedFilter = !filterText || text.indexOf(filterText) !== -1;
        var show = matchedQuery && matchedFilter;

        card.style.display = show ? "" : "none";

        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });

        button.classList.add("is-active");
        activeFilter = button.getAttribute("data-filter") || "";
        applyFilter();
      });
    });

    applyFilter();
  });
})();

function createMoviePlayer(videoId, overlayId, buttonId, movieUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var button = document.getElementById(buttonId);
  var prepared = false;
  var hlsObject = null;

  if (!video || !movieUrl) {
    return;
  }

  function prepareVideo() {
    if (prepared) {
      return Promise.resolve();
    }

    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = movieUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsObject = new Hls();
      hlsObject.loadSource(movieUrl);
      hlsObject.attachMedia(video);

      return new Promise(function (resolve) {
        var done = false;

        hlsObject.on(Hls.Events.MANIFEST_PARSED, function () {
          if (!done) {
            done = true;
            resolve();
          }
        });

        window.setTimeout(function () {
          if (!done) {
            done = true;
            resolve();
          }
        }, 1400);
      });
    }

    video.src = movieUrl;
    return Promise.resolve();
  }

  function beginPlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    prepareVideo().then(function () {
      var playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", beginPlay);
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      beginPlay();
    });
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      beginPlay();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsObject) {
      hlsObject.destroy();
      hlsObject = null;
    }
  });
}
