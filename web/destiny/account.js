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

  getVaultItems() {
    return this.GetVault({definitions: true})
        .then(response => Array.from(bungie.findItems(response.data),
                                     item => new bungie.DestinyItem(item,
                                                                    this.userInfo.membershipType)));
  }

  getVaultItemsTree() {
    return this.getVaultItems().then(items => buildItemsTree(items));
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


const RAID_STEPS = {
    RAID_MOON1: [
        'Traverse the Abyss (The Stills)',
        'Cross the Bridge (Oversoul Throne)',
        'Reach the Summoning Crystal (Oversoul Throne)',
        'Defeat Crota (Oversoul Throne)',
    ],
    RAID_RISE_OF_IRON: [
        'Enter the Wall (Foundry 113)',
        "Defeat Vosik (Splicer's Den)",
        'Travel Down the Wall (Apex)',
        'Destroy the SIVA Source (Perfection Complex)',
        'Defeat Aksis (Perfection Complex)',
    ],
    RAID_TAKEN_KING: [
        'Power the Glyph (Basilica)',
        'Defeat the Warpriest (Basilica)',
        "Defeat Golgoroth (Golgoroth's Cellar)",
        'Defeat the Daughters of Oryx (Threshold)',
        'Defeat Oryx, the Taken King (Threshold)',
    ],
    RAID_VENUS1: [
        "Destroy the Oracles (Templar's Well)",
        "Kill the Templar (Templar's Well)",
        'Awaken the Glass Throne (Vault of Glass)',
        'Destroy Atheon (Vault of Glass)',
    ],
};


function titleCase(s) {
  return s.split(/(\s+)/).map(word => word[0].toUpperCase() + word.substring(1).toLowerCase()).join('');
}


bungie.DestinyCharacter = class DestinyCharacter {
  constructor(data) {
    for (let [k, v] of Object.entries(data))
      this[k] = v;
  }

  getAdvisors() {
    return this.GetAdvisorsForCharacter({definitions: true})
        .then(response => {
          const activities = [];
          for (let advisor of Object.values(response.data.activityAdvisors)) {
            if (advisor.dailyChapterActivities) {
              for (let activityHash of advisor.dailyChapterActivities.tierActivityHashes) {
                const activity = bungie.derefHashes({
                    activeRewardIndexes: advisor.dailyChapterActivities.activeRewardIndexes[activityHash],
                    activityHash,
                    activityTypeName: 'Daily Mission',
                    isCompleted: advisor.dailyChapterActivities.isCompleted,
                    skullIndexes: [],
                });
                activities.push(activity);
              }
            } else if (advisor.dailyCrucible) {
              const bundle = bungie.DEFS.activityBundles[advisor.dailyCrucible.activityBundleHash];
              for (let activityHash of bundle.activityHashes) {
                const activity = {
                    activeRewardIndexes: /*advisor.dailyCrucible.activeRewardIndexes*/ [],
                    activityDef: bundle,
                    activityHash,
                    activityTypeName: 'Daily Crucible',
                    isCompleted: advisor.dailyCrucible.isCompleted,
                    skullIndexes: [],
                };
                activities.push(activity);
              }
            } else if (advisor.heroicStrike) {
              for (let tier of advisor.heroicStrike.tiers) {
                const activity = bungie.derefHashes(tier);
                activity.activityTypeName = 'Heroic Strike';
                activities.push(activity);
              }
            } else if (advisor.materialUpgrades) {
            } else if (advisor.nightfall) {
              for (let tier of advisor.nightfall.tiers) {
                const activity = bungie.derefHashes(tier);
                activity.activityTypeName = 'Nightfall';
                activity.skullIndexes = [];  // TODO: Find the activity entry where these are defined.
                activities.push(activity);
              }
            } else if (advisor.raidActivities) {
              const steps = RAID_STEPS[advisor.raidActivities.raidIdentifier];
              for (let tier of advisor.raidActivities.tiers) {
                const activity = bungie.derefHashes(tier);
                activity.activityTypeName = 'Raid';
                if (steps)
                  activity.steps.forEach((step, i) => {if (!step.displayName) step.displayName = steps[i]});
                activities.push(activity);
              }
            }
          }
          for (let activity of activities) {
            activity.destinationDef = bungie.DEFS.destinations[activity.activityDef.destinationHash];
            activity.placeDef = bungie.DEFS.places[activity.activityDef.placeHash];
            activity.rewards = activity.activeRewardIndexes.map(i => activity.activityDef.rewards[i]);
            activity.skulls = activity.skullIndexes.map(i => activity.activityDef.skulls[i]);
            activity.challenges = activity.skulls.filter(skull => skull.displayName.match(/ Challenge$/));
            activity.modifiers = activity.skulls.filter(skull => !skull.displayName.match(/ Challenge$/));
            if (activity.difficultyIdentifier && activity.difficultyIdentifier.match(/^DIFFICULTY_/) &&
                (activity.difficultyIdentifier != 'DIFFICULTY_NORMAL'))
              activity.modifiers.push({displayName: titleCase(activity.difficultyIdentifier.substring('DIFFICULTY_'.length).replace(/_/g, ' '))});
            if (!activity.steps || !activity.steps.length) {
              activity.steps = [
                  {displayName: `Complete ${activity.activityDef.activityName}`, isComplete: activity.isCompleted},
              ];
            }
          }

          const bounties = [];
          for (let advisor of Object.values(response.data.bounties)) {
          }

          const quests = [];
          for (let advisor of Object.values(response.data.quests.quests)) {
          }

          return {activities, bounties, quests};
        });
  }

  getItems() {
    return this.GetCharacterInventory({definitions: true})
        .then(response => Array.from(bungie.findItems(response.data),
                                     item => new bungie.DestinyItem(item, this.membershipType,
                                                                    this.characterId)));
  }

  getItemsTree() {
    return this.getItems().then(items => buildItemsTree(items));
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



const BUCKET_CATEGORIES = ['Invisible', 'Item', 'Currency', 'Equippable', 'Ignored', 'Unknown'];
const ITEM_STATES = ['None', 'Locked', 'Tracked'];
const LOCATIONS = ['Unknown', 'Inventory', 'Vault', 'Vendor', 'Postmaster'];
const NODE_STATE_NAMES = ['Invalid', 'CanUpgrade', 'NoPoints', 'NoPrerequisites', 'NoSteps',
                          'NoUnlock', 'NoMaterial', 'NoGridLevel', 'SwappingLocked', 'MustSwap',
                          'Complete', 'Unknown', 'CreationOnly', 'Hidden'];
const SOURCE_CATEGORIES = ['None', 'Activity', 'Vendor', 'Aggregate'];
const TRANSFER_STATUSES = ['CanTransfer', 'ItemIsEquipped', 'NotTransferrable', , 'NoRoomInDestination'];


function buildItemsTree(items) {
  const categories = {};
  for (let category of BUCKET_CATEGORIES)
    categories[category] = {};
  for (let item of items) {
    if (!categories[item.bucketCategory][item.bucketName])
      categories[item.bucketCategory][item.bucketName] = [];
    categories[item.bucketCategory][item.bucketName].push(item);
  }
  return categories;
}


bungie.DestinyItem = class DestinyItem {
  constructor(data, membershipType, characterId) {
    for (let [k, v] of Object.entries(bungie.derefHashes(data)))
      this[k] = v;
    this.bucketDef = bungie.DEFS.buckets[this.itemDef.bucketTypeHash];
    this.bucketCategory = this.bucketDef ? BUCKET_CATEGORIES[this.bucketDef.category] : 'Unknown';
    this.bucketName = this.bucketDef ? this.bucketDef.bucketName : 'Unknown';
    this.owner = {characterId, membershipType};
    this.locationName = LOCATIONS[this.location || 0];
    this.questlineItemDef = bungie.DEFS.items[this.itemDef.questlineItemHash];
    this.sources = {};
    for (let category of SOURCE_CATEGORIES)
      this.sources[category] = [];
    for (let code of this.itemDef.sourceHashes || []) {
      let sourceDef = bungie.DEFS.sources[code];
      if (sourceDef) {
        let category = SOURCE_CATEGORIES[sourceDef.category];
        this.sources[category].push(sourceDef);
      }
    }
    this.stateName = ITEM_STATES[this.state];
    this.transferStatusName = TRANSFER_STATUSES[this.transferStatus];
    if (this.nodes && this.talentGridDef && this.talentGridDef.nodes) {
      const nodeDefs = [];
      for (let nodeDef of this.talentGridDef.nodes)
        nodeDefs[nodeDef.nodeHash] = nodeDef;
      for (let node of this.nodes) {
        node.nodeDef = nodeDefs[node.nodeHash];
        node.stateName = NODE_STATE_NAMES[node.state];
        const stepDefs = [];
        for (let stepDef of node.nodeDef.steps)
          stepDefs[stepDef.stepIndex] = stepDef;
        node.stepDef = stepDefs[node.stepIndex];
      }
      this.nodeGrid = this.getNodeGrid();
    }
  }

  getNodeGrid() {
    const grid = [];
    const finalColumn = [];
    for (let node of this.nodes) {
      if ((node.nodeDef.column < 0) || (node.nodeDef.row < 0))
        finalColumn.push(node);
      else {
        if (!grid[node.nodeDef.column])
          grid[node.nodeDef.column] = [];
        grid[node.nodeDef.column][node.nodeDef.row] = node;
      }
    }
    if (finalColumn.length)
      grid.push(finalColumn);
    return grid;
  }

  transfer_(characterId, transferToVault, stackSize) {
    return bungieNetPlatform.destinyService.TransferItem({
        membershipType: this.owner.membershipType,
        itemReferenceHash: this.itemHash,
        itemId: this.itemInstanceId,
        stackSize,
        characterId,
        transferToVault,
    });
  }

  transfer(characterId, stackSize=1) {
    var promise = Promise.resolve();
    if (this.owner.characterId == characterId)
      return promise;
    if (this.owner.characterId)
      promise = promise.then(() => this.transferToVault(stackSize));
    if (characterId)
      promise = promise.then(() => this.transferFromVault(characterId, stackSize));
    return promise;
  }

  transferFromVault(characterId, stackSize=1) {
    return this.transfer_(characterId, false, stackSize)
        .then(() => {this.owner.characterId = characterId});
  }

  transferToVault(stackSize=1) {
    return this.transfer_(this.owner.characterId, true, stackSize)
        .then(() => {this.owner.characterId = null});
  }
};

})();
