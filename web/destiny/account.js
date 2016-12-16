(function() {

var bungie = window.bungie = window.bungie || {};


bungie.Account = class BungieAccount {
  static load(membershipType, membershipId) {
    return new bungie.Account().load(membershipType, membershipId);
  }

  load(membershipType, membershipId) {
    return bungieNetPlatform.userService.GetBungieAccount(membershipId, membershipType)
        .then(data => {
          for (let [k, v] of Object.entries(data.Response))
            this[k] = v;
          this.destinyAccounts = this.destinyAccounts.map(
              account => new bungie.DestinyAccount(account));
          return this;
        });
  }
};


bungie.DestinyAccount = class DestinyAccount {
  constructor(data) {
    for (let [k, v] of Object.entries(data))
      this[k] = v;
    this.characters = this.characters.map(character => new bungie.DestinyCharacter(character));
  }

  GetAllItemsSummary() {
    return bungieNetPlatform.destinyService.GetAllItemsSummary(
        this.userInfo.membershipType, this.userInfo.membershipId);
  }
};


bungie.DestinyCharacter = class DestinyCharacter {
  constructor(data) {
    for (let [k, v] of Object.entries(data))
      this[k] = v;
  }

  GetCharacterInventory() {
    return bungieNetPlatform.destinyService.GetCharacterInventory(
        this.membershipType, this.membershipId, this.characterId);
  }

  GetCharacterInventorySummary() {
    return bungieNetPlatform.destinyService.GetCharacterInventorySummary(
        this.membershipType, this.membershipId, this.characterId);
  }
};

})();
