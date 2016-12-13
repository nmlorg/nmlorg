(function() {

var bungie = window.bungie = window.bungie || {};

bungie.user = bungie.user || {};


bungie.user.getBungieNetUser = function() {
  return bungie.fetch('User/GetBungieNetUser/');
};

})();
