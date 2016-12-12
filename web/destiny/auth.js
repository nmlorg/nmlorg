(function() {

var bungie = window.bungie = window.bungie || {};

bungie.auth = bungie.auth || {};


bungie.auth.login = function() {
  const AUTH = bungie.AUTH;
  const params = {};

  for (let s of window.location.search.substring(1).split('&')) {
    let i = s.indexOf('=');

    if (i == -1)
      params[decodeURIComponent(s)] = '';
    else
      params[decodeURIComponent(s.substring(0, i))] = decodeURIComponent(
          s.substring(i + 1).replace(/[+]/g, ' '));
  }

  function handleAccessTokens(data) {
    if (!data.Response || !data.Response.accessToken || !data.Response.refreshToken)
      throw data;

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

  function reloadPage() {
    const queryString = params.state ? atob(params.state) : '';
    if (queryString)
      window.location.search = queryString;
    else {
      const i = window.location.href.indexOf('?');
      if (i == -1)
        window.location.reload();
      else
        window.location = window.location.href.substring(0, i);
    }
  }

  function scheduleTokenRefresh() {
    const now = Date.now() / 1000;

    if (bungie.reauthTimeout)
      window.clearTimeout(bungie.reauthTimeout);
    console.log(`Reauthenticating in ${AUTH.refresh_ready - now} seconds.`);
    bungie.reauthTimeout = window.setTimeout(function() {
      bungie.fetch('App/GetAccessTokensFromRefreshToken/', {refreshToken: AUTH.refresh_token})
          .then(handleAccessTokens)
          .then(scheduleTokenRefresh);
    }, (AUTH.refresh_ready - now + Math.random()) * 1000);
  }

  const now = Date.now() / 1000;

  if (params.code) {
    return bungie.fetch('App/GetAccessTokensFromCode/', {code: params.code})
        .then(handleAccessTokens)
        .then(reloadPage);
  } else if (AUTH.access_expires && (AUTH.access_expires >= now)) {
    scheduleTokenRefresh();
    return Promise.resolve();
  } else if (AUTH.refresh_token && (AUTH.refresh_ready <= now) && (AUTH.refresh_expires > now)) {
    return bungie.fetch('App/GetAccessTokensFromRefreshToken/', {refreshToken: AUTH.refresh_token})
        .then(handleAccessTokens)
        .then(reloadPage)
        ;
  } else {
    console.log('bungie.auth.login: Redirecting to authorization page. Promise will not finalize.');
    var paramstr = window.location.search.substring(1);
    if (paramstr)
      paramstr = '?state=' + btoa(paramstr);
    window.location = bungie.API_AUTH_URL + paramstr;
    return Promise.reject();
  }
};

})();
