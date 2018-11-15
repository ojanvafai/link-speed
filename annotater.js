
chrome.runtime.sendMessage({getCode: "code"}, (response) => {
  console.log(response.code);
});
