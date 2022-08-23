let settings = {
  volume: 1,
  smartReaderOn: true,
  maxBuffer: 0.5,
};

const volumeSlider = document.getElementById("volume-slider");
const smartReaderOnCheck = document.getElementById("smart-check");
const maxBufferSlider = document.getElementById("max-buffer-slider");

const settingsFromStorage = JSON.parse(
  localStorage.getItem("tubeSpeakerSettings")
);

if (settingsFromStorage) settings = settingsFromStorage;

volumeSlider.value = settings.volume * 100;
smartReaderOnCheck.checked = settings.smartReaderOn;
maxBufferSlider.value = settings.maxBuffer * 100;
disableSliderIfNeeded();

const infoMsg = document.createElement("p");
infoMsg.textContent = "processing...";
infoMsg.style = "display: none;";
infoMsg.classList = ["centered"];
const body = document.getElementsByTagName("body");
body[0].appendChild(infoMsg);

volumeSlider.addEventListener("change", function (e) {
  console.log("volume changed");
  settings.volume = e.currentTarget.value / 100;
  updateLocalStorage();
  sendSettingsToContent();
});

smartReaderOnCheck.addEventListener("change", function (e) {
  console.log("smartReaderOn changed");
  settings.smartReaderOn = e.currentTarget.checked;
  disableSliderIfNeeded();
  updateLocalStorage();
  sendSettingsToContent();
});

maxBufferSlider.addEventListener("change", function (e) {
  console.log("maxBuffer changed");
  settings.maxBuffer = e.currentTarget.value / 100;
  updateLocalStorage();
  sendSettingsToContent();
});

// message from content to inform popup that settings are applied
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.done === true) infoMsg.style = "display: none;";
});

function updateLocalStorage() {
  localStorage.setItem("tubeSpeakerSettings", JSON.stringify(settings));
}

function sendSettingsToContent() {
  infoMsg.style = "display: blank;";
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { settings: settings });
  });
}

function disableSliderIfNeeded() {
  if (settings.smartReaderOn) maxBufferSlider.removeAttribute("disabled");
  else maxBufferSlider.setAttribute("disabled", "disabled");
}
