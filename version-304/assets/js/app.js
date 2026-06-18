(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img[data-image]').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-hidden-image');
            image.removeAttribute('src');
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot') || '0');
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var scope = panel.parentElement || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var searchInput = panel.querySelector('[data-filter-search]');
        var regionSelect = panel.querySelector('[data-filter-region]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var emptyState = scope.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var query = normalize(searchInput && searchInput.value);
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute('data-search'));
                var cardRegion = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matched = true;

                if (query && searchText.indexOf(query) === -1) {
                    matched = false;
                }
                if (region && cardRegion !== region) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && searchInput) {
            searchInput.value = q;
        }
        applyFilters();
    });
})();

function initMoviePlayer(videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;

    if (!video || !overlay || !streamUrl) {
        return;
    }

    function attachStream() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.src) {
                video.src = streamUrl;
            }
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            }
            return;
        }

        if (!video.src) {
            video.src = streamUrl;
        }
    }

    function playVideo() {
        attachStream();
        overlay.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });
    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
        if (!video.ended) {
            overlay.classList.remove('is-hidden');
        }
    });
    video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
    });
    attachStream();
}
