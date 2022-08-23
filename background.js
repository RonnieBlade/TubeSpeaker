function myFunc() {
  window.speechSynthesis.cancel();
}

chrome.tabs.onUpdated.addListener(namedFunction);
function namedFunction(tabId, changeInfo, tab) {
  console.log("workds");
  chrome.scripting.executeScript({
    target: { tabId: tabId, allFrames: true },
    func: myFunc,
  });
}
