(function() {

var bungie = window.bungie = window.bungie || {};


bungie.load = function(key) {
  var val = localStorage.getItem('bungie.' + key);

  return val && JSON.parse(val);
};


bungie.store = function(key, data) {
  localStorage.setItem('bungie.' + key, JSON.stringify(data));
};


var AUTH = bungie.AUTH = bungie.load('AUTH') || {};
var USER = bungie.USER = bungie.load('USER') || {};


bungie.fetch = function(url, data, auth) {
  return new Promise(function(resolve, reject) {
    const req = new XMLHttpRequest();

    req.open(data ? 'POST' : 'GET', 'https://www.bungie.net/Platform/' + url);
    req.addEventListener('load', function(e) {
      if (this.status == 200) {
        const data = JSON.parse(this.responseText);
        console.log('bungie.fetch: `->', data);
        if (data.ErrorCode == 1)
          resolve(data);
        else
          reject(data);
      } else
        reject(this);
    });
    if (bungie.API_KEY)
      req.setRequestHeader('X-API-Key', bungie.API_KEY);
    if (AUTH.access_token && (auth !== false))
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


bungie.getBungieNetUser = function() {
  return bungie.fetch('User/GetBungieNetUser/')
      .then(function(data) {
        USER.displayName = data.Response.user.displayName;
        bungie.store('USER', USER);
      });
};

})();
