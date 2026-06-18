import { H as Hls } from './hls.esm.js';

function setText(element, text) {
  if (element) {
    element.textContent = text;
  }
}

function hide(element) {
  if (element) {
    element.classList.add('is-hidden');
  }
}

function show(element) {
  if (element) {
    element.classList.remove('is-hidden');
  }
}

function attachSource(video, source, status) {
  if (!source) {
    setText(status, '未找到播放源');
    return;
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setText(status, '播放源已就绪');
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setText(status, '视频加载失败，请刷新后重试');
      }
    });

    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.addEventListener('loadedmetadata', function () {
      setText(status, '播放源已就绪');
    });
    return;
  }

  setText(status, '当前浏览器不支持 HLS 播放');
}

function setupPlayer(container) {
  var video = container.querySelector('video');
  var source = container.getAttribute('data-src');
  var overlay = container.querySelector('[data-play-toggle]');
  var playButton = container.querySelector('[data-play-control]');
  var muteButton = container.querySelector('[data-mute-control]');
  var fullscreenButton = container.querySelector('[data-fullscreen-control]');
  var status = container.querySelector('[data-player-status]');

  if (!video) {
    return;
  }

  attachSource(video, source, status);

  function playOrPause() {
    if (video.paused) {
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          setText(status, '点击视频区域后即可播放');
          show(overlay);
        });
      }
    } else {
      video.pause();
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playOrPause);
  }

  if (playButton) {
    playButton.addEventListener('click', playOrPause);
  }

  video.addEventListener('click', playOrPause);

  video.addEventListener('play', function () {
    hide(overlay);
    hide(status);
  });

  video.addEventListener('pause', function () {
    show(overlay);
  });

  video.addEventListener('waiting', function () {
    show(status);
    setText(status, '缓冲中');
  });

  video.addEventListener('playing', function () {
    hide(status);
  });

  video.addEventListener('error', function () {
    show(status);
    setText(status, '视频加载失败，请稍后重试');
  });

  if (muteButton) {
    muteButton.addEventListener('click', function () {
      video.muted = !video.muted;
      muteButton.textContent = video.muted ? '取消静音' : '静音';
    });
  }

  if (fullscreenButton) {
    fullscreenButton.addEventListener('click', function () {
      var target = container.querySelector('.video-frame') || video;
      if (target.requestFullscreen) {
        target.requestFullscreen();
      }
    });
  }
}

Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
