(function() {

var bungie = window.bungie = window.bungie || {};


bungie.Account = class BungieAccount {
  static load(membershipType, membershipId) {
    return new bungie.Account().load(membershipType, membershipId);
  }

  load(membershipType, membershipId) {
    return bungie.user.getBungieAccount(membershipType, membershipId)
        .then(data => {
          this.bungieId = data.Response.bungieNetUser.membershipId;
          this.bungieName = data.Response.bungieNetUser.displayName;
          this.accounts = [];
          for (let account of data.Response.destinyAccounts)
            this.accounts.push(account);
          return this;
        });
  }
};

})();
