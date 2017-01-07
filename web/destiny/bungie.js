(function() {

var bungie = window.bungie = window.bungie || {};


function makePlural(s) {
  if (s[s.length - 1] == 'y')
    return s.substring(0, s.length - 1) + 'ies';
  else
    return s + 's';
}


bungie.derefHashes = function(data) {
  if (data instanceof Array) {
    return data.map(bungie.derefHashes);
  } else if (data instanceof Object) {
    var ret = {};
    for (let [k, v] of Object.entries(data)) {
      if (k.match(/Hash$/)) {
        const base = k.substring(0, k.length - 4);
        const plural = makePlural(base);
        if (bungie.DEFS[plural])
          ret[base + 'Def'] = bungie.DEFS[plural][v];
      } else if (k.match(/Hashes$/)) {
        const base = k.substring(0, k.length - 6);
        const plural = makePlural(base);
        if (bungie.DEFS[plural])
          ret[base + 'Defs'] = v.map(code => bungie.DEFS[plural][code]);
      }
      ret[k] = bungie.derefHashes(v);
    }
    return ret;
  } else
    return data;
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
          if (data.ErrorCode == 1) {
            if (data.Response.definitions) {
              for (let [bucket, defs] of Object.entries(data.Response.definitions)) {
                if (!bungie.DEFS[bucket])
                  bungie.DEFS[bucket] = {};
                for (let [k, v] of Object.entries(defs))
                  bungie.DEFS[bucket][k] = v;
              }
            }
            return resolve(data.Response);
          }
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


bungie.findHash = function(hash) {
  const ret = [];
  for (let [k, v] of Object.entries(bungie.DEFS))
    if (v[hash])
      ret.push([k, v[hash]]);
  return ret;
};


bungie.findItems = function*(data) {
  if (data instanceof Array) {
    for (let item of data)
      yield* bungie.findItems(item);
  } else if (data instanceof Object) {
    if (data.itemHash)
      yield data;
    else
      for (let item of Object.values(data))
        yield* bungie.findItems(item);
  }
};


bungie.init = function(apiKey, authUrl) {
  bungie.API_KEY = apiKey;
  bungie.API_AUTH_URL = authUrl;

  bungie.DEFS = {};

  return Promise.resolve();
};


bungie.load = function(key) {
  var val = localStorage.getItem('bungie.' + key);

  return val && JSON.parse(val);
};


bungie.store = function(key, data) {
  localStorage.setItem('bungie.' + key, JSON.stringify(data));
};

})();
