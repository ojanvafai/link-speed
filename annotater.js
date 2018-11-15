
chrome.runtime.sendMessage({getCode: "code"}, (response) => {
  console.log(response.code);
});

(function() {
  const mutationObserver = new MutationObserver((mutationList) => {
    mutationList.forEach((mutation) => {
      switch(mutation.type) {
      case 'childList':
        for (let newNode of mutation.addedNodes) {
          if (newNode.nodeName != "A")
            continue;
          window.updatingLink("added", newNode);
        }
        for (let newNode of mutation.removedNodes) {
          if (newNode.nodeName != "A")
            continue;
          window.updatingLink("removed", newNode);
        }
        break;
      case 'attributes':
        window.updatingLink("updated", mutation.target);
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
