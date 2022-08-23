const synth = window.speechSynthesis;

let maxWaitTimeTimer;
let timerOn = false;

function speak(txt) {
  updateLocalStorage();

  if (!extensionActive) return;

  const msg = new SpeechSynthesisUtterance();
  msg.text = txt;

  const cyrillicPattern = /[а-яА-ЯЁё]/;

  if (cyrillicPattern.test(txt)) {
    msg.lang = "ru-RU";
  } else {
    msg.lang = "en-US";
  }
  msg.volume = settings.volume;
  msg.rate = determineSpeed(txt);
  synth.speak(msg);

  if (mustSendMsgToPopUp) {
    chrome.runtime.sendMessage({ done: true });
    mustSendMsgToPopUp = false;
  }
}

function determineMaxBuffer() {
  return 20 + settings.maxBuffer * 200;
}

function determineMaxWaitTime() {
  const MaxWaitTime = 1000 + settings.maxBuffer * 6000;
  //console.log(`MaxWaitTime: ${MaxWaitTime}`);
  return MaxWaitTime;
}

function determineSpeed(txt) {
  let speed = document.getElementsByClassName(
    "video-stream html5-main-video"
  )[0].playbackRate;
  if (synth.pending) speed *= 1.2;
  //console.log(`speed: ${speed}, pending: ${synth.pending}`);
  return speed;
}

function addToSpeakStack(txt) {
  // Stop maxWaitTimeTimer
  timerOn = false;
  clearTimeout(maxWaitTimeTimer);

  txtStack += txt;
  let speech;
  // if no smartReaderOn, read immediately
  if (!settings.smartReaderOn) {
    speech = txtStack;
    txtStack = "";
    speak(speech);
    return;
  }

  if (txtStack.length > determineMaxBuffer()) {
    console.log(
      `txtStack is too long(${
        txtStack.length
      } but allowed ${determineMaxBuffer()}), let's speak!`
    );
    speech = txtStack;
    txtStack = "";
    speak(speech);
    return;
  }

  // prevents too long pauses if we stopped reading on a comma
  let finishedOnComma = false;

  let parts = txtStack.split(/\.|\,|\;|\?|\!/);
  if (parts.length > 1) {
    const lastPartLength = parts.pop().length;
    const sentence = txtStack.slice(0, txtStack.length - lastPartLength);
    txtStack = txtStack.slice(txtStack.length - lastPartLength);
    //console.log(sentence);
    speak(sentence);
    if (sentence.endsWith(",")) finishedOnComma = true;
  }

  if (!timerOn) {
    let maxWaitTime = determineMaxWaitTime();
    // prevents too long pauses if we stopped reading on a comma
    if (finishedOnComma) {
      maxWaitTime /= 2;
      console.log(`ended with comma. waittime - ${maxWaitTime}`);
    } else {
      console.log(`waittime - ${maxWaitTime}`);
    }
    timerOn = true;
    // set timer to prevent long pauses
    maxWaitTimeTimer = setTimeout(() => {
      timerOn = false;
      console.log(
        `Timeout after waiting for ${maxWaitTime} milliseconds, let's speak!`
      );
      speech = txtStack;
      txtStack = "";
      speak(speech);
      return;
    }, maxWaitTime);
  }
}

function sliceSubs(newSubs, oldSubs) {
  if (newSubs.startsWith(oldSubs)) {
    return newSubs.slice(oldSubs.length);
  }
  // minumum amount of symbols to compare strings
  let includeCount = 2;

  while (newSubs.includes(oldSubs.slice(oldSubs.length - includeCount))) {
    includeCount++;
  }

  if (includeCount > 2) {
    let substring = oldSubs.slice(oldSubs.length - (includeCount - 1));
    return newSubs.replace(substring, "");
  }

  return newSubs;
}

function updateLocalStorage() {
  localStorage.setItem("tubeSpeakerSettings", JSON.stringify(settings));
}
