(async function() {
  const CONSOLE_LOG = `console.log(state, link, speed);`;
  const HIGHLIGHT = `
    if (speed.fcp90 < 3000) return;
    const new_el = document.createElement("div")
    new_el.style.width = "100%";
    new_el.style.height = "100%";


    new_el.style.position = "absolute";
    new_el.style.top = link.offsetTop + "px";
    new_el.style.height = link.offsetHeight + "px";
    new_el.style.left = link.offsetLeft + "px";
    new_el.style.width = link.offsetWidth + "px";
    new_el.style.pointerEvents = "none";

    new_el.style.backgroundColor = "#ff0000";
    new_el.style.opacity = 0.6;

    if (link.offsetParent)
      link.offsetParent.appendChild(new_el);
  `

  const FONT_COLOR = `
    if (speed.fcp90 < 3000) return;
    link.style.color = "red";
  `
  const WARNING_ICON = `
if (speed.fcp90 < 3000)
  return;

link.style.whiteSpace = 'nowrap';

let lastTextNode = link;
while (lastTextNode && lastTextNode.nodeType != Node.TEXT_NODE) {
  lastTextNode = lastTextNode.lastChild;
}

let wrapper = document.createElement('span');
wrapper.style.whiteSpace = 'nowrap';

let after = document.createElement('span');
after.style.cssText = \`
  font-weight: bold;
  color: red;
  position: absolute;
\`;
after.textContent = '\\u26A0';

wrapper.append(after); 
link.append(wrapper);
`;

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
    else if (state_.selected == 'warning_icon')
      state_.eval = WARNING_ICON;

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
    let selected = e.target.id == 'textarea' ? 'eval' : e.target.id;
    selectedChanged(selected);
  });
})();
