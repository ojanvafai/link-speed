(async function() {
  const CONSOLE_LOG = `console.log(link);`;

  function getState() {
    return new Promise(resolve => {
      chrome.storage.sync.get({state: null}, result => resolve(result.state));
    });
  }

  // TODO: should this be fire & forget, or not?
  // TODO: maybe throttle this?
  function setState() {
    return new Promise(resolve => {
      chrome.storage.sync.set({state: state_}, result => resolve());
    });
  }

  let state_ = await getState();
  if (!("selected" in state_)) {
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
    await setState();
  });
})();
