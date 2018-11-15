(async function() {
  function applyState() {
    document.getElementById("textarea").value = state.eval;
    switch(state.selected) {
    case 'log':
      window.updatingLink = (state, a) => {
        console.log("state: " + state);
        console.log(a);
      }
      break;
    case 'highlight':
      window.updatingLink = (state, a) => {
        console.log("highlight: state: " + state);
        console.log(a);
      }
      break;
    case 'eval':
      eval(state.eval);
      break;
    default:
      throw "invalid selected state " + state.selected;
    }
  }

  async function getState() {
    return new Promise(resolve => {
      chrome.storage.sync.get(['state'], result => resolve(result));
    });
  }

  // TODO: should this be fire & forget, or not?
  // TODO: maybe throttle this?
  function setState() {
    return new Promise(resolve => {
      chrome.storage.sync.set(['state'], state);
    });
  }

  let state = await getState();
  if (!("selected" in state) || !("eval" in state)) {
    state = {
      selected: "log",
      eval: "",
    }
  }

  applyState();


  document.getElementById("fieldset").addEventListener("change", (e) => {
    if (e.target.id == "textarea")
      state.eval = document.getElementById("textarea").value;
    else
      state.selected = e.target.id;

    applyState();
  });
})();
