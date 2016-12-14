(function() {

var bungie = window.bungie = window.bungie || {};

bungie.destiny = bungie.user || {};


bungie.destiny.searchDestinyPlayer = function(username, network='all') {
  return bungie.fetch(`Destiny/SearchDestinyPlayer/${encodeURIComponent(network)}/${encodeURIComponent(username)}/`);
};

})();
