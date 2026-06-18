(function () {
  var player = document.querySelector('[data-video-url]');
  if (!player) {
    return;
  }
  var video = player.querySelector('video');
  var button = player.querySelector('.play-button');
  var url = player.getAttribute('data-video-url');
  var ready = false;
  var hlsInstance = null;

  function prepare() {
    if (ready || !video || !url) {
      return;
    }
    ready = true;
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function start() {
    prepare();
    if (!video) {
      return;
    }
    video.controls = true;
    player.classList.add('is-playing');
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        player.classList.remove('is-playing');
      });
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0) {
        player.classList.remove('is-playing');
      }
    });
  }
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
