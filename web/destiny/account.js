(function() {

var bungie = window.bungie = window.bungie || {};


bungie.Account = class BungieAccount {
  static load(membershipType, membershipId) {
    return new bungie.Account().load(membershipType, membershipId);
  }

  load(membershipType, membershipId) {
    return bungieNetPlatform.userService.GetBungieAccount(membershipId, membershipType)
        .then(response => {
          for (let [k, v] of Object.entries(response))
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

  GetAccount(p_={}) {
    return bungieNetPlatform.destinyService.GetAccount(
        this.userInfo.membershipType, this.userInfo.membershipId, p_);
  }

  GetAccountSummary(p_={}) {
    return bungieNetPlatform.destinyService.GetAccountSummary(
        this.userInfo.membershipType, this.userInfo.membershipId, p_);
  }

  GetAdvisorsForAccount(p_={}) {
    return bungieNetPlatform.destinyService.GetAdvisorsForAccount(
        this.userInfo.membershipType, this.userInfo.membershipId, p_);
  }

  GetAllItemsSummary(p_={}) {
    return bungieNetPlatform.destinyService.GetAllItemsSummary(
        this.userInfo.membershipType, this.userInfo.membershipId, p_);
  }

  GetBondAdvisors(p_={}) {
    return bungieNetPlatform.destinyService.GetBondAdvisors(
        this.userInfo.membershipType, p_);
  }

  GetBungieAccount(p_={}) {
    return bungieNetPlatform.userService.GetBungieAccount(
        this.userInfo.membershipId, this.userInfo.membershipType, p_);
  }

  GetExcellenceBadges(p_={}) {
    return bungieNetPlatform.destinyService.GetExcellenceBadges(
        this.userInfo.membershipType, this.userInfo.membershipId, p_);
  }

  GetGrimoireByMembership(p_={}) {
    return bungieNetPlatform.destinyService.GetGrimoireByMembership(
        this.userInfo.membershipType, this.userInfo.membershipId, p_);
  }

  GetHistoricalStatsForAccount(p_={}) {
    return bungieNetPlatform.destinyService.GetHistoricalStatsForAccount(
        this.userInfo.membershipType, this.userInfo.membershipId, p_);
  }

  GetLeaderboards(p_={}) {
    return bungieNetPlatform.destinyService.GetLeaderboards(
        this.userInfo.membershipType, this.userInfo.membershipId, p_);
  }

  GetMyGrimoire(p_={}) {
    return bungieNetPlatform.destinyService.GetMyGrimoire(
        this.userInfo.membershipType, p_);
  }

  GetTriumphs(p_={}) {
    return bungieNetPlatform.destinyService.GetTriumphs(
        this.userInfo.membershipType, this.userInfo.membershipId, p_);
  }

  GetVault(p_={}) {
    return bungieNetPlatform.destinyService.GetVault(
        this.userInfo.membershipType, p_);
  }

  GetVaultSummary(p_={}) {
    return bungieNetPlatform.destinyService.GetVaultSummary(
        this.userInfo.membershipType, p_);
  }

  RefreshClanSettingsInDestiny(p_={}) {
    return bungieNetPlatform.groupService.RefreshClanSettingsInDestiny(
        this.userInfo.membershipType, p_);
  }
};


bungie.DestinyCharacter = class DestinyCharacter {
  constructor(data) {
    for (let [k, v] of Object.entries(data))
      this[k] = v;
  }

  GetActivityHistory(p_={}) {
    return bungieNetPlatform.destinyService.GetActivityHistory(
        this.membershipType, this.membershipId, this.characterId, p_);
  }

  GetAdvisorsForCharacter(p_={}) {
    return bungieNetPlatform.destinyService.GetAdvisorsForCharacter(
        this.membershipType, this.membershipId, this.characterId, p_);
  }

  GetAdvisorsForCharacterV2(p_={}) {
    return bungieNetPlatform.destinyService.GetAdvisorsForCharacterV2(
        this.membershipType, this.membershipId, this.characterId, p_);
  }

  GetAdvisorsForCurrentCharacter(p_={}) {
    return bungieNetPlatform.destinyService.GetAdvisorsForCurrentCharacter(
        this.membershipType, this.characterId, p_);
  }

  GetAllVendorsForCurrentCharacter(p_={}) {
    return bungieNetPlatform.destinyService.GetAllVendorsForCurrentCharacter(
        this.membershipType, this.characterId, p_);
  }

  GetCharacter(p_={}) {
    return bungieNetPlatform.destinyService.GetCharacter(
        this.membershipType, this.membershipId, this.characterId, p_);
  }

  GetCharacterActivities(p_={}) {
    return bungieNetPlatform.destinyService.GetCharacterActivities(
        this.membershipType, this.membershipId, this.characterId, p_);
  }

  GetCharacterInventory(p_={}) {
    return bungieNetPlatform.destinyService.GetCharacterInventory(
        this.membershipType, this.membershipId, this.characterId, p_);
  }

  GetCharacterInventorySummary(p_={}) {
    return bungieNetPlatform.destinyService.GetCharacterInventorySummary(
        this.membershipType, this.membershipId, this.characterId, p_);
  }

  GetCharacterProgression(p_={}) {
    return bungieNetPlatform.destinyService.GetCharacterProgression(
        this.membershipType, this.membershipId, this.characterId, p_);
  }

  GetCharacterSummary(p_={}) {
    return bungieNetPlatform.destinyService.GetCharacterSummary(
        this.membershipType, this.membershipId, this.characterId, p_);
  }

  GetDestinyAggregateActivityStats(p_={}) {
    return bungieNetPlatform.destinyService.GetDestinyAggregateActivityStats(
        this.membershipType, this.membershipId, this.characterId, p_);
  }

  GetHistoricalStats(p_={}) {
    return bungieNetPlatform.destinyService.GetHistoricalStats(
        this.membershipType, this.membershipId, this.characterId, p_);
  }

  GetLeaderboardsForCharacter(p_={}) {
    return bungieNetPlatform.destinyService.GetLeaderboardsForCharacter(
        this.membershipType, this.membershipId, this.characterId, p_);
  }

  GetUniqueWeaponHistory(p_={}) {
    return bungieNetPlatform.destinyService.GetUniqueWeaponHistory(
        this.membershipType, this.membershipId, this.characterId, p_);
  }

  GetVendorSummariesForCurrentCharacter(p_={}) {
    return bungieNetPlatform.destinyService.GetVendorSummariesForCurrentCharacter(
        this.membershipType, this.characterId, p_);
  }
};

})();
