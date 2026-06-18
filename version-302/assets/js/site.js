function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function svgFallback(title) {
  const safeTitle = String(title || "高清剧集大全").replace(/[<&>]/g, "");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#0f172a"/>
          <stop offset="0.55" stop-color="#164e63"/>
          <stop offset="1" stop-color="#1d4ed8"/>
        </linearGradient>
      </defs>
      <rect width="600" height="900" fill="url(#g)"/>
      <circle cx="520" cy="110" r="150" fill="#22d3ee" opacity="0.2"/>
      <circle cx="70" cy="780" r="190" fill="#3b82f6" opacity="0.18"/>
      <text x="60" y="410" font-size="54" fill="#e0f2fe" font-family="Arial, sans-serif" font-weight="700">${safeTitle.slice(0, 10)}</text>
      <text x="60" y="490" font-size="28" fill="#bae6fd" font-family="Arial, sans-serif">高清剧集大全</text>
    </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

ready(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("img[data-fallback-title]").forEach(function (img) {
    img.addEventListener("error", function () {
      img.src = svgFallback(img.getAttribute("data-fallback-title"));
    }, { once: true });
  });

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  const searchInput = document.querySelector("[data-search-input]");
  const yearFilter = document.querySelector("[data-year-filter]");
  const cards = Array.from(document.querySelectorAll(".movie-card[data-title]"));
  const emptyState = document.querySelector("[data-empty-state]");

  function applyFilters() {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const yearValue = yearFilter ? yearFilter.value : "";
    let visibleCount = 0;

    cards.forEach(function (card) {
      const haystack = [
        card.dataset.title,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.year
      ].join(" ").toLowerCase();
      const cardYear = Number(card.dataset.year || 0);
      let yearOk = true;

      if (yearValue === "2020") {
        yearOk = cardYear <= 2020;
      } else if (yearValue) {
        yearOk = String(cardYear) === yearValue;
      }

      const keywordOk = !keyword || haystack.includes(keyword);
      const shouldShow = keywordOk && yearOk;
      card.style.display = shouldShow ? "" : "none";
      if (shouldShow) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount ? "none" : "block";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }
  if (yearFilter) {
    yearFilter.addEventListener("change", applyFilters);
  }

  document.querySelectorAll("[data-video-url]").forEach(function (box) {
    const video = box.querySelector("video");
    const button = box.querySelector("[data-play-button]");
    const url = box.getAttribute("data-video-url");
    let loaded = false;

    function loadAndPlay() {
      if (!video || !url) {
        return;
      }

      if (!loaded) {
        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        loaded = true;
      }

      video.play().catch(function () {
        video.controls = true;
      });
    }

    if (button) {
      button.addEventListener("click", loadAndPlay);
    }
  });
});
