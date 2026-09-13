let cachedProxy = null;
let proxyEnabled = false;

async function initCache() {
  try {
    const data = await browser.storage.local.get(['activeProxy', 'proxyEnabled']);
    cachedProxy = data.activeProxy || null;
    proxyEnabled = !!data.proxyEnabled;
  } catch (error) {
    console.error(error);
  }
}

browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.activeProxy) {
      cachedProxy = changes.activeProxy.newValue || null;
    }
    if (changes.proxyEnabled) {
      proxyEnabled = !!changes.proxyEnabled.newValue;
    }
  }
});

initCache();

function handleProxyRequest(requestInfo) {
  if (!proxyEnabled || !cachedProxy) {
    return { type: "direct" };
  }

  const type = cachedProxy.type;
  const host = cachedProxy.host;
  const port = parseInt(cachedProxy.port, 10);

  const proxyInfo = {
    type: type,
    host: host,
    port: port
  };

  if (type === "socks" || type === "socks4") {
    proxyInfo.proxyDNS = type === "socks";
  }

  if (cachedProxy.username && cachedProxy.password) {
    if (type === "socks") {
      proxyInfo.username = cachedProxy.username;
      proxyInfo.password = cachedProxy.password;
    } else if (type === "http" || type === "https") {
      try {
        const credentials = btoa(`${cachedProxy.username}:${cachedProxy.password}`);
        proxyInfo.proxyAuthorizationHeader = `Basic ${credentials}`;
      } catch (e) {
        console.error(e);
      }
    }
  }

  return proxyInfo;
}

browser.proxy.onRequest.addListener(handleProxyRequest, { urls: ["<all_urls>"] });

function handleAuthRequired(details) {
  if (details.isProxy && proxyEnabled && cachedProxy && cachedProxy.username && cachedProxy.password) {
    return {
      authCredentials: {
        username: cachedProxy.username,
        password: cachedProxy.password
      }
    };
  }
  return {};
}

browser.webRequest.onAuthRequired.addListener(
  handleAuthRequired,
  { urls: ["<all_urls>"] },
  ["blocking"]
);
