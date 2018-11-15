
chrome.runtime.sendMessage({getCode: "code"}, (response) => {
  let foo = eval(response.code);
  console.log(foo);
  foo('bar');
});
