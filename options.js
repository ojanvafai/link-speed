(function() {
  document.getElementById("fieldset").addEventListener("change", (e) => {
    switch(e.target.id) {
    case 'log':
      window.updatingLink = (state, a) => {
        console.log("state: " + state);
        console.log(a);
      }
      break;
    case 'eval':
    case 'textarea':
      eval(document.getElementById("textarea").value);
      break;
    default:
      throw "invalid form element item id " + e.target.id;
    }
  });
})();

/*
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
*/
