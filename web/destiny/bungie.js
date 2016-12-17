(function() {

var bungie = window.bungie = window.bungie || {};


bungie.load = function(key) {
  var val = localStorage.getItem('bungie.' + key);

  return val && JSON.parse(val);
};


bungie.store = function(key, data) {
  localStorage.setItem('bungie.' + key, JSON.stringify(data));
};


bungie.fetch = function(url, data) {
  const auth = !url.match(/^app[/]getaccesstokens/i);
  var tries = 50;
  var backoff = 100;
  var method = 'GET';
  var sendData = null;

  if (data) {
    method = 'POST';
    sendData = JSON.stringify(data);
  }

  url = 'https://www.bungie.net/Platform/' + url;

  return new Promise(function BungieFetch(resolve, reject) {
    const req = new XMLHttpRequest();

    req.open(method, url);
    req.addEventListener('loadend', function(e) {
      if (this.status == 200) {
        try {
          const data = JSON.parse(this.responseText);
          console.log('bungie.fetch: `->', data);
          if (data.ErrorCode == 1)
            return resolve(data.Response);
        } catch(e) {
          console.log('bungie.fetch: `->', e);
        }
      }
      if (!tries--)
        return reject(this);
      window.setTimeout(BungieFetch, backoff, resolve, reject);
      backoff = Math.min(backoff * 2, 2000);
    });
    if (bungie.API_KEY)
      req.setRequestHeader('X-API-Key', bungie.API_KEY);
    if ((auth !== false) && bungie.accessToken)
      req.setRequestHeader('Authorization', 'Bearer ' + bungie.accessToken);
    console.log('bungie.fetch:', method, url, data, tries, backoff);
    req.send(sendData);
  });
};



bungie.init = function(apiKey, authUrl) {
  bungie.API_KEY = apiKey;
  bungie.API_AUTH_URL = authUrl;

  return Promise.resolve();
};

})();
