(function() {

var bungie = window.bungie = window.bungie || {};

bungie.user = bungie.user || {};


bungie.user.getBungieAccount = function(membershipType, membershipId) {
  return bungie.fetch(`User/GetBungieAccount/${membershipId}/${membershipType}/`);
};


bungie.user.getBungieNetUser = function() {
  return bungie.fetch('User/GetBungieNetUser/');
};


bungie.user.getCurrentBungieAccount = function() {
  return bungie.fetch('User/GetCurrentBungieAccount/');
};


bungie.user.getCurrentBungieNetUser = function() {
  return bungie.fetch('User/GetCurrentBungieNetUser/');
};


bungie.user.searchUsers = function(username) {
  return bungie.fetch(`User/SearchUsers/?q=${encodeURIComponent(username)}`);
};

})();
