function save(key) {
  if (timer)
    clearTimeout(timer);

  timer = setTimeout(function() {
    timer = null;
    var data = {};
    data[key] = document.getElementById(key).value;
    chrome.storage.sync.set(data, function() {});
  }, 100);
};

chrome.storage.sync.get({
  custom_callback_code: null,
}, function(items) {
  var content = document.getElementById('content');
  let textarea = document.createElement('textarea');
  textarea.onkeydown = function() {
    save('custom_callback_code');
  };
  content.append(textarea);
});
