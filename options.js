(async function() {
  const CONSOLE_LOG = `console.log(link);`;
  const HIGHLIGHT = `
    const r = link.getBoundingClientRect()
    const new_el = document.createElement("div")
    new_el.style.position = "absolute";
    new_el.style.top = r.top + "px";
    new_el.style.height = (r.bottom - r.top) + "px";
    new_el.style.left = r.left + "px";
    new_el.style.width = (r.right - r.left) + "px";

    new_el.style.backgroundColor = "#ff0000";
    new_el.style.opacity = 0.6;

    document.documentElement.appendChild(new_el);
  `
  const FONT_COLOR = `
    link.style.color = "red";
  `

  function getState() {
    return new Promise(resolve => {
      chrome.storage.sync.get({state: null}, result => resolve(result.state));
    });
  }

  // TODO: should this be fire & forget, or not?
  // TODO: maybe throttle this?
  function setState() {
    if (state_.selected == "eval")
      state_.eval = textarea_.value;
    else if (state_.selected == 'log')
      state_.eval = CONSOLE_LOG;
    else if (state_.selected == 'highlight')
      state_.eval = HIGHLIGHT;
    else if (state_.selected == 'font_color')
      state_.eval = FONT_COLOR;

    return new Promise(resolve => {
      chrome.storage.sync.set({state: state_}, result => {
        chrome.runtime.sendMessage({updateCode: "true"}, (response) => resolve());
      });
    });
  }

  let state_ = await getState();
  if (!state_) {
    state_ = {
      selected: "log",
      eval: CONSOLE_LOG,
    }
  }

  document.getElementById(state_.selected).checked = true;

  let textarea_ = document.getElementById('textarea');

  if (state_.selected == 'eval')
    textarea_.value = state_.eval;

  let timer_;
  textarea_.onkeydown = (e) => {
    if (timer_)
      clearTimeout(timer_);

    timer_ = setTimeout(function() {
      timer_ = null;
      setState();
    }, 100);
  };

  textarea_.onfocus = (e) => {
    document.getElementById('eval').checked = true;
    selectedChanged('eval');
  }

  async function selectedChanged(selected) {
    state_.selected = selected;
    await setState();
  }

  document.getElementById("fieldset").addEventListener("change", (e) => {
    selectedChanged(e.target.id);
  });
})();
