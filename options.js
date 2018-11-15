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

  document.getElementById("fieldset").addEventListener("change", async (e) => {
    state_.selected = e.target.id;
    if (e.target.id == "eval")
      state_.eval = document.getElementById("textarea").value;
    else if (state_.selected == 'log')
      state_.eval = CONSOLE_LOG;
    else if (state_.selected == 'highlight')
      state_.eval = HIGHLIGHT;
    else if (state_.selected == 'font_color')
      state_.eval = FONT_COLOR;
    await setState();
  });
})();
