(function() {

var bungie = window.bungie = {};


bungie.load = function(key) {
  var val = localStorage.getItem('bungie.' + key);

  return val && JSON.parse(val);
};


bungie.store = function(key, data) {
  localStorage.setItem('bungie.' + key, JSON.stringify(data));
};


var AUTH = bungie.AUTH = bungie.load('AUTH') || {};
var USER = bungie.USER = bungie.load('USER') || {};


bungie.fetch = function(url, data) {
  return new Promise(function(resolve, reject) {
    const req = new XMLHttpRequest();

    req.open(data ? 'POST' : 'GET', 'https://www.bungie.net/Platform/' + url);
    req.addEventListener('load', function(e) {
      if (this.status == 200) {
        const data = JSON.parse(this.responseText);
        console.log('bungie.fetch: `->', data);
        resolve(data);
      } else
        reject(this);
    });
    if (bungie.API_KEY)
      req.setRequestHeader('X-API-Key', bungie.API_KEY);
    if (AUTH.access_token)
      req.setRequestHeader('Authorization', 'Bearer ' + AUTH.access_token);
    console.log('bungie.fetch:', data ? 'POST' : 'GET', url, data);
    req.send(data ? JSON.stringify(data) : null);
  });
};



bungie.init = function(apiKey, authUrl) {
  bungie.API_KEY = apiKey;
  bungie.API_AUTH_URL = authUrl;

  return Promise.resolve();
};


bungie.login = function() {
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
    if (data.Response && data.Response.accessToken && data.Response.refreshToken) {
      const now = Date.now() / 1000;

      AUTH.access_token = data.Response.accessToken.value;
      AUTH.access_ready = now + data.Response.accessToken.readyin;
      AUTH.access_expires = now + data.Response.accessToken.expires;
      AUTH.refresh_token = data.Response.refreshToken.value;
      AUTH.refresh_ready = now + data.Response.refreshToken.readyin;
      AUTH.refresh_expires = now + data.Response.refreshToken.expires;
      AUTH.scope = data.Response.scope;
      bungie.store('AUTH', AUTH);
      if (params.state)
        window.location.search = atob(params.state);
      else
        window.location.search = '';
    }

    throw data;
  }

  const now = Date.now() / 1000;

  if (params.code) {
    return bungie.fetch('App/GetAccessTokensFromCode/', {code: params.code})
        .then(handleAccessTokens);
  } else if (AUTH.access_expires && (AUTH.access_expires >= now)) {
    return Promise.resolve();
  } else if (AUTH.refresh_token && (AUTH.refresh_ready <= now) && (AUTH.refresh_expires > now)) {
    return bungie.fetch('App/GetAccessTokensFromRefreshToken/', {refreshToken: AUTH.refresh_token})
        .then(handleAccessTokens);
  } else {
    console.log('bungie.login: Redirecting to authorization page. Promise will not finalize.');
    var paramstr = window.location.search.substring(1);
    if (paramstr)
      paramstr = '?state=' + btoa(paramstr);
    window.location = bungie.API_AUTH_URL + paramstr;
    return Promise.reject();
  }
};


bungie.getBungieNetUser = function() {
  return bungie.fetch('User/GetBungieNetUser/')
      .then(function(data) {
        USER.displayName = data.Response.user.displayName;
        bungie.store('USER', USER);
      });
};

})();
