(function () {
  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var show = document.querySelector(".hero-show");

    if (!show) {
      return;
    }

    var slides = Array.prototype.slice.call(show.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var index = 0;

    function activate(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        activate(i);
      });
    });

    activate(0);

    if (slides.length > 1) {
      setInterval(function () {
        activate(index + 1);
      }, 5200);
    }
  }

  function initFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-search-area]"));

    areas.forEach(function (area) {
      var input = area.querySelector(".js-search");
      var sort = area.querySelector(".js-sort");
      var grid = area.parentElement.querySelector(".js-movie-grid");

      if (!grid) {
        grid = document.querySelector(".js-movie-grid");
      }

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function matchCard(card, query) {
        if (!query) {
          return true;
        }

        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-category"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();

        return haystack.indexOf(query) !== -1;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var sortValue = sort ? sort.value : "year-desc";
        var sorted = cards.slice();

        sorted.sort(function (a, b) {
          var ay = Number(a.getAttribute("data-year")) || 0;
          var by = Number(b.getAttribute("data-year")) || 0;
          var ai = Number(a.getAttribute("data-id")) || 0;
          var bi = Number(b.getAttribute("data-id")) || 0;
          var at = a.getAttribute("data-title") || "";
          var bt = b.getAttribute("data-title") || "";

          if (sortValue === "year-asc") {
            return ay - by || ai - bi;
          }

          if (sortValue === "title-asc") {
            return at.localeCompare(bt, "zh-Hans-CN") || ai - bi;
          }

          if (sortValue === "id-asc") {
            return ai - bi;
          }

          return by - ay || ai - bi;
        });

        sorted.forEach(function (card) {
          card.classList.toggle("hidden", !matchCard(card, query));
          grid.appendChild(card);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      if (sort) {
        sort.addEventListener("change", apply);
      }

      apply();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
