chrome.runtime.sendMessage({getCode: "code"}, (response) => {
  console.log(response.code);
});

// DON'T CHECK IN
const API_KEY="AIzaSyCTBTG6ouekwiL_z11bvIsKuZ_CkuC8qT0";

(function() {

  async function wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  // Throttle PSI requests
  let psiCalls = 0;

  async function getSiteSpeed(pageUrl) {
    let api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    const parameters = {
      url: encodeURIComponent('https://en.wikipedia.org/wiki/Speed'),
      category: "best-practices", // can't turn lighthouse off - use cheapest
      strategy: "desktop",
      fields: "analysisUTCTimestamp%2CcaptchaResult%2Cid%2Ckind%2CloadingExperience%2CoriginLoadingExperience%2Cversion",
      key: API_KEY    
    };
    let first = true;
    for (key in parameters) {
      api += first ? "?" : "&";
      api += `${key}=${parameters[key]}`;
      first = false;
    }
    psiCalls++;
    await wait(2000 * (psiCalls-1));
    const response = await fetch(api);
    psiCalls--;
    const json = await response.json();
    if ('loadingExperience' in json)
      return json.loadingExperience.overall_category.toLowerCase();
    if ('originLoadingExperience' in json)
      return json.originLoadingExperience.overall_category.toLowerCase();
    return "";
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
