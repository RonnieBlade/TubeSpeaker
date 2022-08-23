let lastNotificationTime = new Date(0);

function addStartEvent() {
  myBtn.addEventListener(
    "click",
    function () {
      isOn = true;
      startPlaying();
    },
    { once: true }
  );
}

function addStopEvent() {
  myBtn.addEventListener(
    "click",
    function () {
      isOn = false;
      stopPlaying();
    },
    { once: true }
  );
}

function startPlaying() {
  if (!extensionActive) {
    extensionActive = true;
    mountSubtitles();
    myBtn.textContent = "STOP";
    myBtn.classList.add("stop-btn");
    myBtn.classList.remove("play-btn");
    addStopEvent();
  }
}

function stopPlaying() {
  if (extensionActive) {
    window.speechSynthesis.cancel();
    extensionActive = false;
    myBtn.textContent = "PLAY";
    myBtn.classList.add("play-btn");
    myBtn.classList.remove("stop-btn");
    addStartEvent();
    lastNotificationTime = new Date(0);
  }
}

function renderBtn() {
  ytMenu = document.querySelector(
    "#container #top-row ytd-video-owner-renderer"
  );

  if (ytMenu) {
    ytMenu.appendChild(btnContainer);
    addStartEvent();
  } else {
    //console.log("no btns tab under the player");
    setTimeout(renderBtn, 500);
  }
}

function mountSubtitles() {
  if (!extensionActive) return;

  searching = true;

  subtitlesEL = document.getElementsByClassName("captions-text");

  if (subtitlesEL && Array.from(subtitlesEL).length > 0) {
    timerCheck(timer, mountSubtitles, 300);

    searching = false;

    const subEl = document.getElementsByClassName("captions-text")[0];

    oldSubs = newSubs;
    newSubs = subEl.textContent;
    const sliced = sliceSubs(newSubs, oldSubs);

    if (sliced != "") {
      addToSpeakStack(sliced + " ");
    }

    subsElObserver.observe(subEl, { childList: true });
  } else {
    //console.log("no element");
    notify();
    setTimeout(mountSubtitles, 300);
  }
}

let timer;

function timerCheck(timer, func, timespan) {
  timer = setTimeout(() => {
    if (!searching) {
      func();
    }
  }, timespan);
}

function notify() {
  turnOnSubtitlesBtn = document.querySelector(
    ".ytp-subtitles-button.ytp-button"
  );

  // if subtitles btn is clicked and captions are temperarely not on the screen
  if (
    turnOnSubtitlesBtn &&
    turnOnSubtitlesBtn.getAttribute("aria-pressed") == "true"
  )
    return;

  // if AD is on the screen
  const ad = document.querySelector(".ytp-ad-text");
  if (ad) return;

  let now = new Date();
  // show notification is the last one was long enough ago
  if (now - lastNotificationTime > 15000) {
    showNotification(
      "warning",
      "Press 'c' to turn on the captions",
      "TubeSpeaker Hint",
      "TubeSpeaker Hint"
    );
    lastNotificationTime = new Date();
  }
}
