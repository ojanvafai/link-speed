let code_ = '';

function getState() {
  return new Promise(resolve => {
    chrome.storage.sync.get({state: null}, result => resolve(result.state));
  });
}

async function sendCode(callback) {
  if (!code_) {
    let state = await getState();
    if (!state) {
      console.log('no annotation code');
      return;
    }
 
    code_ = `(state, link, speed) => {
      ${state.eval}
    }`;
  }

  callback({code: code_});
}

// TODO: Need to fix race condition of not having code_ before this message arrives.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.getCode == "code") {
    sendCode(sendResponse);
    return true;
  }
});
