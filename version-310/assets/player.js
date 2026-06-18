(function () {
    var video = document.querySelector('[data-player]');
    var overlay = document.querySelector('[data-play-overlay]');

    if (!video) {
        return;
    }

    var source = video.getAttribute('data-hls');
    var hlsInstance = null;
    var ready = false;

    function attach() {
        if (ready || !source) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function play() {
        attach();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (!ready || video.paused) {
            play();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
