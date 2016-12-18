(function() {

var bungie = window.bungie = window.bungie || {};


bungie.derefHashes = function(data) {
  if (data instanceof Array) {
    return data.map(bungie.derefHashes);
  } else if (data instanceof Object) {
    var ret = {};
    for (let [k, v] of Object.entries(data)) {
      if (k == 'activityHash')
        ret.activityDef = bungie.DEFS.activities[v];
      else if (k == 'bucketTypeHash')
        ret.bucketTypeDef = bungie.DEFS.bucketTypes[v];
      else if (k == 'damageTypeHash')
        ret.damageTypeDef = bungie.DEFS.damageTypes[v];
      else if (k == 'destinationHash')
        ret.destinationDef = bungie.DEFS.destinations[v];
      else if (k == 'itemHash')
        ret.itemDef = bungie.DEFS.items[v];
      else if (k == 'objectiveHash')
        ret.objectiveDef = bungie.DEFS.objectives[v];
      else if (k == 'perkHash')
        ret.itemDef = bungie.DEFS.perks[v];
      else if (k == 'progressionHash')
        ret.itemDef = bungie.DEFS.progressions[v];
      else if (k == 'statHash')
        ret.statDef = bungie.DEFS.stats[v];
      else if (k == 'talentGridHash')
        ret.statDef = bungie.DEFS.talentGrids[v];
      else
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
