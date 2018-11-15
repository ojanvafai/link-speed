chrome.runtime.sendMessage({getCode: "code"}, (response) => {
  let foo = eval(response.code);
  console.log(foo);
  foo('bar');
});

(function() {
  function getSiteSpeed() {
    return new Promise(resolve => resolve("slow"));
  }

  async function updateAnnotation(state, a) {
    const speed = await getSiteSpeed(a.href)
    console.log(state + " : " + a.href + " : " + speed);
//    window.updatingLink(state, a, speed);
  }

  const mutationObserver = new MutationObserver((mutationList) => {
    mutationList.forEach((mutation) => {
      switch(mutation.type) {
      case 'childList':
        for (let newNode of mutation.addedNodes) {
          if (newNode.nodeName != "A")
            continue;
          updateAnnotation("added", newNode);
        }
        for (let newNode of mutation.removedNodes) {
          if (newNode.nodeName != "A")
            continue;
          updateAnnotation("removed", newNode);
        }
        break;
      case 'attributes':
        updateAnnotation("updated", mutation.target);
        break;
      default:
        throw "unhandled mutation of type " + mutation.type;
      }
    });
  });

  const mutationObserverOptions = {
    attributeFilter: ["href"],
    attributeOldValue: false,
    attributes: true,
    childList: true,
    subtree: true,
  };
  mutationObserver.observe(document.documentElement, mutationObserverOptions);
})();
