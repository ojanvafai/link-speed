function getUpdatingLinkFunction() {
  return new Promise(resolve => {
    if (!window.updatingLink) {
      chrome.runtime.sendMessage({getCode: "code"}, (response) => {
        window.updatingLink = eval(response.code);
        resolve(window.updatingLink);
      });
      return;
    }
    resolve(window.updatingLink);
  });
}

// TODO: Don't check this in (and cycle the key).
const API_KEY="AIzaSyCTBTG6ouekwiL_z11bvIsKuZ_CkuC8qT0";

(function() {

  async function wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  // Throttle PSI requests
  let psiCalls = 0;

  // Stub out for testing
  const fakeData = true;

  async function getSiteSpeed(pageUrl) {
    if (fakeData) {
      return {
        fcp90: Math.round(Math.random()*8000),
        fcp95: Math.round(Math.random()*500),
        urlSpecific: !!Math.round(Math.random())
      }
    }
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
    // Quota is 60 queries per 100 seconds per user :-(
    await wait(2000 * (psiCalls-1));
    const response = await fetch(api);
    psiCalls--;
    const json = await response.json();
    let crux = json.loadingExperience || json.originLoadingExperience;
    if (!crux)
      return {};
    return {
      fcp90: crux.metrics.FIRST_CONTENTFUL_PAINT_MS.percentile,
      fid95: crux.metrics.FIRST_INPUT_DELAY_MS.percentile,
      urlSpecific: 'loadingExperience' in json,
    };
  }

  async function updateAnnotation(state, a) {
    // Ignore #foo hrefs as they just scroll the page.
    if (location.origin == a.origin && location.pathname == a.pathname)
      return;

    // TODO: Make updates and removes work.
    if (state != 'added')
      return; 

    const speed = await getSiteSpeed(a.href)
    console.log(state + " : " + a.href + " : " + JSON.stringify(speed));
    let updatingLink = await getUpdatingLinkFunction();
    updatingLink(state, a, speed);
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
