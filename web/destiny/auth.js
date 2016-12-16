(function() {

var bungie = window.bungie = window.bungie || {};

bungie.auth = bungie.auth || {};


function getTokens(code) {
  return bungieNetPlatform.applicationService.GetAccessTokensFromCode({code})
      .then(handleAccessTokens)
      .then(scheduleTokenRefresh)
      .catch(navigateToLogin);
}


function handleAccessTokens(data) {
  if (!data.Response || !data.Response.accessToken || !data.Response.refreshToken)
    throw data;

  const AUTH = bungie.AUTH;
  const now = Date.now() / 1000;

  AUTH.access_token = data.Response.accessToken.value;
  AUTH.access_ready = now + data.Response.accessToken.readyin;
  AUTH.access_expires = now + data.Response.accessToken.expires;
  AUTH.refresh_token = data.Response.refreshToken.value;
  AUTH.refresh_ready = now + data.Response.refreshToken.readyin;
  AUTH.refresh_expires = now + data.Response.refreshToken.expires;
  AUTH.scope = data.Response.scope;
  bungie.store('AUTH', AUTH);
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
      {refreshToken: bungie.AUTH.refresh_token})
      .then(handleAccessTokens)
      .then(scheduleTokenRefresh)
      .catch(navigateToLogin);
}


function scheduleTokenRefresh() {
  if (bungie.reauthTimeout)
    window.clearTimeout(bungie.reauthTimeout);
  const delay = Math.ceil((bungie.AUTH.refresh_ready + Math.random()) * 1000 - Date.now());
  console.log(`Reauthenticating in ${delay} ms.`);
  bungie.reauthTimeout = window.setTimeout(refreshTokens, delay);
}


bungie.auth.init = function() {
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

  const AUTH = bungie.AUTH;
  const now = Date.now() / 1000;

  if (AUTH.access_expires && (AUTH.access_expires >= now))
    scheduleTokenRefresh();

  return Promise.resolve();
};


bungie.auth.login = function() {
  const AUTH = bungie.AUTH;
  const now = Date.now() / 1000;

  if (AUTH.access_expires && (AUTH.access_expires >= now)) {
    scheduleTokenRefresh();
    return Promise.resolve();
  } else if (AUTH.refresh_token && (AUTH.refresh_ready <= now) && (AUTH.refresh_expires > now)) {
    return refreshTokens();
  } else {
    return navigateToLogin();
  }
};

})();
