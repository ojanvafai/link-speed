let code_ = '';

function sendCode() {
  if (!code_) {
    chrome.storage.sync.get({
      custom_callback_code: null,
    }, (items) => {
      let code = items.custom_callback_code;
      if (!code)
        console.log('no annotation code');
      console.log('code:', code);
      code_ = code;
    });    
  }

  sendResponse({code: code_});
}

// TODO: Need to fix race condition of not having code_ before this message arrives.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(sender.tab ?
              "from a content script:" + sender.tab.url :
              "from the extension");
  if (request.getCode == "code") {
    sendCode();
    return true;
  }
});
