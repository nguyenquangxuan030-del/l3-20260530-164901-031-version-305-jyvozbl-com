(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
    var active = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === active);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === active);
        });
        thumbs.forEach(function (thumb, i) {
            thumb.classList.toggle('is-active', i === active);
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
        });
    });

    thumbs.forEach(function (thumb, i) {
        thumb.addEventListener('mouseenter', function () {
            showSlide(i);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-search-input]');
        var grid = scope.querySelector('[data-filterable]');
        var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));

        if (!grid) {
            return;
        }

        function activeFilter() {
            var selected = chips.find(function (chip) {
                return chip.classList.contains('is-active');
            });
            return selected ? selected.getAttribute('data-filter') : 'all';
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var filter = activeFilter();
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var category = card.getAttribute('data-category') || '';
                var type = card.getAttribute('data-type') || '';
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var filterMatch = filter === 'all' || category === filter || type === filter || haystack.indexOf(filter) !== -1;
                card.hidden = !(keywordMatch && filterMatch);
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                chip.classList.add('is-active');
                applyFilter();
            });
        });
    });
})();
