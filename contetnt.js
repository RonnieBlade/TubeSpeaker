// notifications
let notificationContainer = document.createElement("div");
notificationContainer.setAttribute("id", "notification-container");
notificationContainer.setAttribute("style", "position: absolute;");
let body = document.getElementsByTagName("body")[0];
body.appendChild(notificationContainer);

// getting font-awesome for notifications
let fontAwesome = document.createElement("link");
fontAwesome.setAttribute("rel", "stylesheet");
fontAwesome.setAttribute(
  "href",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
);
body.appendChild(fontAwesome);

let settings = {
  volume: 1,
  smartReaderOn: true,
  maxBuffer: 0.5,
};

// is START button active
let isOn = false;

let searching = false;
let extensionActive = false;

let mustSendMsgToPopUp = false;

let txtStack = "";
let oldSubs = "";
let newSubs = "";

let subtitlesEL;
let ytMenu;
let ytPause;

// load settings from Storage
const settingsFromStorage = JSON.parse(
  localStorage.getItem("tubeSpeakerSettings")
);

if (settingsFromStorage) settings = settingsFromStorage;

if ("speechSynthesis" in window) {
  // Speech Synthesis supported
  console.log("Speech Synthesis supported, tubeSpeaker activated");
} else {
  // Speech Synthesis Not Supported
  alert("Sorry, your browser doesn't support text to speech!");
}

// subtitles observer
const subsElObserver = new MutationObserver(function (e) {
  if (e[0].removedNodes) {
    clearTimeout(timer);
    mountSubtitles();
  }
});

let screen = document.getElementById("movie_player");
// screen observer to react on pause and play
const screenObserver = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (
      document.getElementById("movie_player").classList.contains("paused-mode")
    ) {
      stopPlaying();
      //console.log("paused");
    }
    if (
      document.getElementById("movie_player").classList.contains("playing-mode")
    ) {
      if (isOn) startPlaying();
      //console.log("resumed");
    }
  });
});

// configuration of the screen observer
const config = { attributes: true };

if (screen) screenObserver.observe(screen, config);

let myBtn = document.getElementById("my-button");
const btnContainer = document.createElement("div");

if (!myBtn) {
  myBtn = document.createElement("button");
  myBtn.textContent = "PLAY";
  myBtn.id = "play-btn";
  myBtn.classList.add("my-button", "play-btn");
  btnContainer.classList.add("btn-container");
  btnContainer.appendChild(myBtn);
  renderBtn();
}

// received settings from popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  settings = request.settings;
  //console.log(`Settings: ${JSON.stringify(settings)}`);
  mustSendMsgToPopUp = true;
});
