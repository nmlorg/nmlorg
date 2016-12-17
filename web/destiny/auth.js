(function() {

var bungie = window.bungie = window.bungie || {};

bungie.auth = bungie.auth || {};


var AUTH = {};
var deauthTimeout = null;
var reauthTimeout = null;


function getTokens(code) {
  return bungieNetPlatform.applicationService.GetAccessTokensFromCode({code})
      .then(handleAccessTokens)
      .catch(navigateToLogin);
}


function handleAccessTokens(response) {
  if (!response.accessToken || !response.refreshToken)
    throw response;

  const now = Date.now() / 1000;

  AUTH.access_token = response.accessToken.value;
  AUTH.access_ready = now + response.accessToken.readyin;
  AUTH.access_expires = now + response.accessToken.expires;
  AUTH.refresh_token = response.refreshToken.value;
  AUTH.refresh_ready = now + response.refreshToken.readyin;
  AUTH.refresh_expires = now + response.refreshToken.expires;
  AUTH.scope = response.scope;
  bungie.store('AUTH', AUTH);
  scheduleTokenRefresh();
}


function navigateToLogin() {
  console.log('bungie.auth: Redirecting to authorization page. Promise will not finalize.');
  var paramstr = window.location.search.substring(1);
  if (paramstr)
    paramstr = '?state=' + btoa(paramstr);
  window.location.replace(bungie.API_AUTH_URL + paramstr);
  return Promise.reject();
}


function refreshTokens() {
  return bungieNetPlatform.applicationService.GetAccessTokensFromRefreshToken(
      {refreshToken: AUTH.refresh_token})
      .then(handleAccessTokens)
      .catch(navigateToLogin);
}


function scheduleTokenRefresh() {
  bungie.accessToken = AUTH.access_token;

  if (deauthTimeout)
    window.clearTimeout(deauthTimeout);
  var delay = Math.ceil((AUTH.access_expires - Math.random()) * 1000 - Date.now());
  console.log(`Deauthenticating in ${delay} ms.`);
  deauthTimeout = window.setTimeout(() => {bungie.accessToken = null}, delay);

  if (reauthTimeout)
    window.clearTimeout(reauthTimeout);
  var delay = Math.ceil((AUTH.refresh_ready + Math.random()) * 1000 - Date.now());
  console.log(`Reauthenticating in ${delay} ms.`);
  reauthTimeout = window.setTimeout(refreshTokens, delay);
}


bungie.auth.init = function() {
  AUTH = bungie.load('AUTH') || {};

  const params = {};

  for (let s of window.location.search.substring(1).split('&')) {
    let i = s.indexOf('=');

    if (i == -1)
      params[decodeURIComponent(s)] = '';
    else
      params[decodeURIComponent(s.substring(0, i))] = decodeURIComponent(
          s.substring(i + 1).replace(/[+]/g, ' '));
  }

  if (params.code) {
    let base = window.location.href;
    const i = base.indexOf('?');
    if (i > -1)
      base = base.substring(0, i);
    window.history.replaceState(null, document.title,
                                base + (params.state ? '?' + atob(params.state) : ''));

    return getTokens(params.code);
  }

  return bungie.auth.login(true);
};


bungie.auth.login = function(passive) {
  const now = Date.now() / 1000;

  if (AUTH.access_expires && (AUTH.access_expires >= now)) {
    scheduleTokenRefresh();
    return Promise.resolve();
  } else if (AUTH.refresh_token && (AUTH.refresh_ready <= now) && (AUTH.refresh_expires > now)) {
    return refreshTokens();
  } else if (!passive) {
    return navigateToLogin();
  } else {
    return Promise.resolve();
  }
};

})();
