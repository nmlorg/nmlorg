(function() {

const E = encodeURIComponent;
const F = bungie.fetch;

function P(params) {
  var s = '';
  for (let [k, v] of Object.entries(params))
    s += `${s ? '&' : '?'}${E(k)}=${E(v)}`;
  return s;
}

window.bungieNetPlatform = {
  ActivityService: {
    FollowTag: function(p_={}) {
      return F('Activity/Tag/Follow/' + P(p_));
    },
    FollowUser: function(param1, p_={}) {
      return F(`Activity/User/${E(param1)}/Follow/` + P(p_));
    },
    GetApplicationActivityForUser: function(param1, param2, p_={}) {
      return F(`Activity/User/${E(param1)}/Activities/Application/${E(param2)}/` + P(p_));
    },
    GetEntitiesFollowedByCurrentUser: function(p_={}) {
      return F('Activity/Following/' + P(p_));
    },
    GetEntitiesFollowedByCurrentUserV2: function(param1, param2, p_={}) {
      return F(`Activity/Following/V2/${E(param1)}/${E(param2)}/` + P(p_));
    },
    GetEntitiesFollowedByUser: function(param1, p_={}) {
      return F(`Activity/User/${E(param1)}/Following/` + P(p_));
    },
    GetEntitiesFollowedByUserV2: function(param1, param2, param3, p_={}) {
      return F(`Activity/User/${E(param1)}/Following/V2/${E(param2)}/${E(param3)}/` + P(p_));
    },
    GetFollowersOfTag: function(p_={}) {
      return F('Activity/Tag/Followers/' + P(p_));
    },
    GetFollowersOfUser: function(profileId, p_={}) {
      return F(`Activity/User/${E(profileId)}/Followers/` + P(p_));
    },
    GetForumActivityForUser: function(param1, p_={}) {
      return F(`Activity/User/${E(param1)}/Activities/Forums/` + P(p_));
    },
    GetForumActivityForUserV2: function(param1, p_={}) {
      return F(`Activity/User/${E(param1)}/Activities/ForumsV2/` + P(p_));
    },
    GetFriends: function(p_={}) {
      return F('Activity/Friends/' + P(p_));
    },
    GetFriendsAllNoPresence: function(param1, p_={}) {
      return F(`Activity/Friends/AllNoPresence/${E(param1)}/` + P(p_));
    },
    GetFriendsPaged: function(membershipType, currentPage, p_={}) {
      return F(`Activity/Friends/Paged/${E(membershipType)}/${E(currentPage)}/` + P(p_));
    },
    GetGroupsFollowedByCurrentUser: function(p_={}) {
      return F('Activity/Following/Groups/' + P(p_));
    },
    GetGroupsFollowedByUser: function(param1, p_={}) {
      return F(`Activity/User/${E(param1)}/Following/Groups/` + P(p_));
    },
    GetGroupsFollowedPagedByCurrentUser: function(param1, p_={}) {
      return F(`Activity/Following/Groups/${E(param1)}/` + P(p_));
    },
    GetGroupsFollowedPagedByUser: function(param1, param2, p_={}) {
      return F(`Activity/User/${E(param1)}/Following/Groups/Paged/${E(param2)}/` + P(p_));
    },
    GetLikeAndShareActivityForUser: function(param1, p_={}) {
      return F(`Activity/User/${E(param1)}/Activities/LikesAndShares/` + P(p_));
    },
    GetLikeAndShareActivityForUserV2: function(param1, p_={}) {
      return F(`Activity/User/${E(param1)}/Activities/LikesAndSharesV2/` + P(p_));
    },
    GetLikeShareAndForumActivityForUser: function(param1, p_={}) {
      return F(`Activity/User/${E(param1)}/Activities/LikeShareAndForum/` + P(p_));
    },
    GetUsersFollowedByCurrentUser: function(p_={}) {
      return F('Activity/Following/Users/' + P(p_));
    },
    UnfollowTag: function(p_={}) {
      return F('Activity/Tag/Unfollow/' + P(p_));
    },
    UnfollowUser: function(param1, p_={}) {
      return F(`Activity/User/${E(param1)}/Unfollow/` + P(p_));
    },
  },
  AdminService: {
    AdminUserSearch: function(p_={}) {
      return F('Admin/Member/Search/' + P(p_));
    },
    BulkEditPost: function(p_={}) {
      return F('Admin/BulkEditPost/' + P(p_));
    },
    GetAdminHistory: function(param1, param2, p_={}) {
      return F(`Admin/GlobalHistory/${E(param1)}/${E(param2)}/` + P(p_));
    },
    GetAssignedReports: function(p_={}) {
      return F('Admin/Assigned/' + P(p_));
    },
    GetDisciplinedReportsForMember: function(param1, p_={}) {
      return F(`Admin/Member/${E(param1)}/Reports/` + P(p_));
    },
    GetRecentDisciplineAndFlagHistoryForMember: function(param1, param2, p_={}) {
      return F(`Admin/Member/${E(param1)}/RecentIncludingFlags/${E(param2)}` + P(p_));
    },
    GetResolvedReports: function(p_={}) {
      return F('Admin/Reports/' + P(p_));
    },
    GetUserBanState: function(param1, p_={}) {
      return F(`Admin/Member/${E(param1)}/GetBanState/` + P(p_));
    },
    GetUserPostHistory: function(param1, param2, p_={}) {
      return F(`Admin/Member/${E(param1)}/PostHistory/${E(param2)}/` + P(p_));
    },
    GetUserWebClientIpHistory: function(param1, p_={}) {
      return F(`Admin/Member/${E(param1)}/GetWebClientIpHistory/` + P(p_));
    },
    GloballyIgnoreItem: function(p_={}) {
      return F('Admin/Ignores/GloballyIgnore/' + P(p_));
    },
    OverrideBanOnUser: function(param1, p_={}) {
      return F(`Admin/Member/${E(param1)}/SetBan/` + P(p_));
    },
    OverrideGlobalIgnore: function(p_={}) {
      return F('Admin/Ignores/OverrideGlobalIgnore/' + P(p_));
    },
    OverrideGroupWallBanOnUser: function(param1, p_={}) {
      return F(`Admin/Member/${E(param1)}/SetGroupWallBan/` + P(p_));
    },
    OverrideMsgBanOnUser: function(param1, p_={}) {
      return F(`Admin/Member/${E(param1)}/SetMsgBan/` + P(p_));
    },
    OverturnReport: function(p_={}) {
      return F('Admin/Reports/Overturn/' + P(p_));
    },
    ResolveReport: function(p_={}) {
      return F('Admin/Assigned/Resolve/' + P(p_));
    },
  },
  ApplicationService: {
    ApplicationSearch: function(p_={}) {
      return F('App/Search/' + P(p_));
    },
    ChangeApiKeyStatus: function(param1, param2, p_={}) {
      return F(`App/ChangeApiKeyState/${E(param1)}/${E(param2)}/` + P(p_));
    },
    CreateApiKey: function(param1, p_={}) {
      return F(`App/CreateApiKey/${E(param1)}/` + P(p_));
    },
    CreateApplication: function(p_={}) {
      return F('App/CreateApplication/' + P(p_));
    },
    EditApplication: function(param1, p_={}) {
      return F(`App/EditApplication/${E(param1)}/` + P(p_));
    },
    GetAccessTokensFromCode: function(p_={}) {
      return F('App/GetAccessTokensFromCode/' + P(p_));
    },
    GetAccessTokensFromRefreshToken: function(p_={}) {
      return F('App/GetAccessTokensFromRefreshToken/' + P(p_));
    },
    GetApplication: function(param1, p_={}) {
      return F(`App/Application/${E(param1)}/` + P(p_));
    },
    GetApplicationApiKeys: function(param1, p_={}) {
      return F(`App/ApplicationApiKeys/${E(param1)}/` + P(p_));
    },
    GetAuthorizationForUserAndApplication: function(param1, param2, p_={}) {
      return F(`App/Authorization/${E(param1)}/${E(param2)}/` + P(p_));
    },
    GetAuthorizations: function(param1, p_={}) {
      return F(`App/Authorizations/${E(param1)}/` + P(p_));
    },
    PrivateApplicationSearch: function(p_={}) {
      return F('App/PrivateSearch/' + P(p_));
    },
    RevokeAuthorization: function(param1, param2, p_={}) {
      return F(`App/RevokeAuthorization/${E(param1)}/${E(param2)}/` + P(p_));
    },
  },
  CommunitycontentService: {
    AdminSetCommunityLiveMemberBanStatus: function(param1, param2, param3, p_={}) {
      return F(`CommunityContent/Live/Partnerships/${E(param1)}/${E(param2)}/Ban/${E(param3)}/` + P(p_));
    },
    AdminSetCommunityLiveMemberFeatureStatus: function(param1, param2, param3, p_={}) {
      return F(`CommunityContent/Live/Partnerships/${E(param1)}/${E(param2)}/Feature/${E(param3)}/` + P(p_));
    },
    AlterApprovalState: function(param1, p_={}) {
      return F(`CommunityContent/AlterApprovalState/${E(param1)}/` + P(p_));
    },
    EditContent: function(param1, p_={}) {
      return F(`CommunityContent/Edit/${E(param1)}/` + P(p_));
    },
    GetAdminCommunityLiveStatuses: function(param1, param2, p_={}) {
      return F(`CommunityContent/Live/Admin/${E(param1)}/${E(param2)}/` + P(p_));
    },
    GetApprovalQueue: function(param1, param2, param3, p_={}) {
      return F(`CommunityContent/Queue/${E(param1)}/${E(param2)}/${E(param3)}/` + P(p_));
    },
    GetCommunityContent: function(param1, param2, param3, p_={}) {
      return F(`CommunityContent/Get/${E(param1)}/${E(param2)}/${E(param3)}/` + P(p_));
    },
    GetCommunityFeaturedActivityModes: function(p_={}) {
      return F('CommunityContent/Live/ActivityModes/Featured/' + P(p_));
    },
    GetCommunityLiveStatuses: function(partnershipType, communityStatusSort, page, p_={}) {
      return F(`CommunityContent/Live/All/${E(partnershipType)}/${E(communityStatusSort)}/${E(page)}/` + P(p_));
    },
    GetCommunityLiveStatusesForClanmates: function(partnershipType, communityStatusSort, page, p_={}) {
      return F(`CommunityContent/Live/Clan/${E(partnershipType)}/${E(communityStatusSort)}/${E(page)}/` + P(p_));
    },
    GetCommunityLiveStatusesForFriends: function(partnershipType, communityStatusSort, page, p_={}) {
      return F(`CommunityContent/Live/Friends/${E(partnershipType)}/${E(communityStatusSort)}/${E(page)}/` + P(p_));
    },
    GetFeaturedCommunityLiveStatuses: function(partnershipType, communityStatusSort, page, p_={}) {
      return F(`CommunityContent/Live/Featured/${E(partnershipType)}/${E(communityStatusSort)}/${E(page)}/` + P(p_));
    },
    GetStreamingStatusForMember: function(partnershipType, membershipType, membershipId, p_={}) {
      return F(`CommunityContent/Live/Users/${E(partnershipType)}/${E(membershipType)}/${E(membershipId)}/` + P(p_));
    },
    SubmitContent: function(p_={}) {
      return F('CommunityContent/Submit/' + P(p_));
    },
  },
  ContentService: {
    GetCareer: function(param1, p_={}) {
      return F(`Content/Careers/${E(param1)}/` + P(p_));
    },
    GetCareers: function(p_={}) {
      return F('Content/Careers/' + P(p_));
    },
    GetContentById: function(param1, param2, p_={}) {
      return F(`Content/GetContentById/${E(param1)}/${E(param2)}/` + P(p_));
    },
    GetContentByTagAndType: function(param1, param2, param3, p_={}) {
      return F(`Content/GetContentByTagAndType/${E(param1)}/${E(param2)}/${E(param3)}/` + P(p_));
    },
    GetContentType: function(param1, p_={}) {
      return F(`Content/GetContentType/${E(param1)}/` + P(p_));
    },
    GetDestinyContent: function(param1, p_={}) {
      return F(`Content/Site/Destiny/${E(param1)}/` + P(p_));
    },
    GetDestinyContentV2: function(param1, p_={}) {
      return F(`Content/Site/Destiny/V2/${E(param1)}/` + P(p_));
    },
    GetFeaturedArticle: function(p_={}) {
      return F('Content/Site/Featured/' + P(p_));
    },
    GetHomepageContent: function(param1, p_={}) {
      return F(`Content/Site/Homepage/${E(param1)}/` + P(p_));
    },
    GetHomepageContentV2: function(p_={}) {
      return F('Content/Site/Homepage/V2/' + P(p_));
    },
    GetJobs: function(param1, p_={}) {
      return F(`Content/Site/Jobs/${E(param1)}/` + P(p_));
    },
    GetNews: function(param1, param2, p_={}) {
      return F(`Content/Site/News/${E(param1)}/${E(param2)}/` + P(p_));
    },
    GetPromoWidget: function(p_={}) {
      return F('Content/Site/Destiny/Promo/' + P(p_));
    },
    GetPublications: function(param1, p_={}) {
      return F(`Content/Site/Publications/${E(param1)}/` + P(p_));
    },
    SearchCareers: function(p_={}) {
      return F('Content/Careers/Search/' + P(p_));
    },
    SearchContentByTagAndType: function(param1, param2, param3, p_={}) {
      return F(`Content/SearchContentByTagAndType/${E(param1)}/${E(param2)}/${E(param3)}/` + P(p_));
    },
    SearchContentEx: function(param1, p_={}) {
      return F(`Content/SearchEx/${E(param1)}/` + P(p_));
    },
    SearchContentWithText: function(param1, p_={}) {
      return F(`Content/Search/${E(param1)}/` + P(p_));
    },
  },
  CoreService: {
    GetAvailableLocales: function(p_={}) {
      return F('/GetAvailableLocales/' + P(p_));
    },
    GetCommonSettings: function(p_={}) {
      return F('/Settings/' + P(p_));
    },
    GetGlobalAlerts: function(p_={}) {
      return F('/GlobalAlerts/' + P(p_));
    },
    GetSystemStatus: function(param1, p_={}) {
      return F(`/Status/${E(param1)}/` + P(p_));
    },
    HelloWorld: function(p_={}) {
      return F('/HelloWorld/' + P(p_));
    },
  },
  DestinyService: {
    BuyItem: function(p_={}) {
      return F('Destiny/BuyItem/' + P(p_));
    },
    EquipItem: function(p_={}) {
      return F('Destiny/EquipItem/' + P(p_));
    },
    EquipItems: function(p_={}) {
      return F('Destiny/EquipItems/' + P(p_));
    },
    GetAccount: function(membershipType, destinyMembershipId, p_={}) {
      return F(`Destiny/${E(membershipType)}/Account/${E(destinyMembershipId)}/` + P(p_));
    },
    GetAccountSummary: function(membershipType, destinyMembershipId, p_={}) {
      return F(`Destiny/${E(membershipType)}/Account/${E(destinyMembershipId)}/Summary/` + P(p_));
    },
    GetActivityBlob: function(e, p_={}) {
      return F(`Destiny/Stats/ActivityBlob/${E(e)}/` + P(p_));
    },
    GetActivityHistory: function(membershipType, destinyMembershipId, characterId, p_={}) {
      return F(`Destiny/Stats/ActivityHistory/${E(membershipType)}/${E(destinyMembershipId)}/${E(characterId)}/` + P(p_));
    },
    GetAdvisorsForAccount: function(membershipType, destinyMembershipId, p_={}) {
      return F(`Destiny/${E(membershipType)}/Account/${E(destinyMembershipId)}/Advisors/` + P(p_));
    },
    GetAdvisorsForCharacter: function(membershipType, destinyMembershipId, characterId, p_={}) {
      return F(`Destiny/${E(membershipType)}/Account/${E(destinyMembershipId)}/Character/${E(characterId)}/Advisors/` + P(p_));
    },
    GetAdvisorsForCharacterV2: function(membershipType, destinyMembershipId, characterId, p_={}) {
      return F(`Destiny/${E(membershipType)}/Account/${E(destinyMembershipId)}/Character/${E(characterId)}/Advisors/V2/` + P(p_));
    },
    GetAdvisorsForCurrentCharacter: function(membershipType, characterId, p_={}) {
      return F(`Destiny/${E(membershipType)}/MyAccount/Character/${E(characterId)}/Advisors/` + P(p_));
    },
    GetAllItemsSummary: function(membershipType, destinyMembershipId, p_={}) {
      return F(`Destiny/${E(membershipType)}/Account/${E(destinyMembershipId)}/Items/` + P(p_));
    },
    GetAllVendorsForCurrentCharacter: function(membershipType, characterId, p_={}) {
      return F(`Destiny/${E(membershipType)}/MyAccount/Character/${E(characterId)}/Vendors/` + P(p_));
    },
    GetBondAdvisors: function(membershipType, p_={}) {
      return F(`Destiny/${E(membershipType)}/MyAccount/Advisors/Bonds/` + P(p_));
    },
    GetCharacter: function(membershipType, destinyMembershipId, characterId, p_={}) {
      return F(`Destiny/${E(membershipType)}/Account/${E(destinyMembershipId)}/Character/${E(characterId)}/Complete/` + P(p_));
    },
    GetCharacterActivities: function(membershipType, destinyMembershipId, characterId, p_={}) {
      return F(`Destiny/${E(membershipType)}/Account/${E(destinyMembershipId)}/Character/${E(characterId)}/Activities/` + P(p_));
    },
    GetCharacterInventory: function(membershipType, destinyMembershipId, characterId, p_={}) {
      return F(`Destiny/${E(membershipType)}/Account/${E(destinyMembershipId)}/Character/${E(characterId)}/Inventory/` + P(p_));
    },
    GetCharacterInventorySummary: function(membershipType, destinyMembershipId, characterId, p_={}) {
      return F(`Destiny/${E(membershipType)}/Account/${E(destinyMembershipId)}/Character/${E(characterId)}/Inventory/Summary/` + P(p_));
    },
    GetCharacterProgression: function(membershipType, destinyMembershipId, characterId, p_={}) {
      return F(`Destiny/${E(membershipType)}/Account/${E(destinyMembershipId)}/Character/${E(characterId)}/Progression/` + P(p_));
    },
    GetCharacterSummary: function(membershipType, destinyMembershipId, characterId, p_={}) {
      return F(`Destiny/${E(membershipType)}/Account/${E(destinyMembershipId)}/Character/${E(characterId)}/` + P(p_));
    },
    GetClanLeaderboards: function(param1, p_={}) {
      return F(`Destiny/Stats/ClanLeaderboards/${E(param1)}/` + P(p_));
    },
    GetDestinyAggregateActivityStats: function(membershipType, destinyMembershipId, characterId, p_={}) {
      return F(`Destiny/Stats/AggregateActivityStats/${E(membershipType)}/${E(destinyMembershipId)}/${E(characterId)}/` + P(p_));
    },
    GetDestinyExplorerItems: function(p_={}) {
      return F('Destiny/Explorer/Items/' + P(p_));
    },
    GetDestinyExplorerTalentNodeSteps: function(p_={}) {
      return F('Destiny/Explorer/TalentNodeSteps/' + P(p_));
    },
    GetDestinyLiveTileContentItems: function(p_={}) {
      return F('Destiny/LiveTiles/' + P(p_));
    },
    GetDestinyManifest: function(p_={}) {
      return F('Destiny/Manifest/' + P(p_));
    },
    GetDestinySingleDefinition: function(definitionType, definitionId, p_={}) {
      return F(`Destiny/Manifest/${E(definitionType)}/${E(definitionId)}/` + P(p_));
    },
    GetExcellenceBadges: function(membershipType, destinyMembershipId, p_={}) {
      return F(`Destiny/Stats/GetExcellenceBadges/${E(membershipType)}/${E(destinyMembershipId)}/` + P(p_));
    },
    GetGrimoireByMembership: function(membershipType, destinyMembershipId, p_={}) {
      return F(`Destiny/Vanguard/Grimoire/${E(membershipType)}/${E(destinyMembershipId)}/` + P(p_));
    },
    GetGrimoireDefinition: function(p_={}) {
      return F('Destiny/Vanguard/Grimoire/Definition/' + P(p_));
    },
    GetHistoricalStats: function(membershipType, destinyMembershipId, characterId, p_={}) {
      return F(`Destiny/Stats/${E(membershipType)}/${E(destinyMembershipId)}/${E(characterId)}/` + P(p_));
    },
    GetHistoricalStatsDefinition: function(p_={}) {
      return F('Destiny/Stats/Definition/' + P(p_));
    },
    GetHistoricalStatsForAccount: function(membershipType, destinyMembershipId, p_={}) {
      return F(`Destiny/Stats/Account/${E(membershipType)}/${E(destinyMembershipId)}/` + P(p_));
    },
    GetItemDetail: function(membershipType, destinyMembershipId, characterId, itemInstanceId, p_={}) {
      return F(`Destiny/${E(membershipType)}/Account/${E(destinyMembershipId)}/Character/${E(characterId)}/Inventory/${E(itemInstanceId)}/` + P(p_));
    },
    GetItemReferenceDetail: function(param1, param2, param3, param4, p_={}) {
      return F(`Destiny/${E(param1)}/Account/${E(param2)}/Character/${E(param3)}/ItemReference/${E(param4)}/` + P(p_));
    },
    GetLeaderboards: function(membershipType, destinyMembershipId, p_={}) {
      return F(`Destiny/Stats/Leaderboards/${E(membershipType)}/${E(destinyMembershipId)}/` + P(p_));
    },
    GetLeaderboardsForCharacter: function(membershipType, destinyMembershipId, characterId, p_={}) {
      return F(`Destiny/Stats/Leaderboards/${E(membershipType)}/${E(destinyMembershipId)}/${E(characterId)}/` + P(p_));
    },
    GetLeaderboardsForPsn: function(p_={}) {
      return F('Destiny/Stats/LeaderboardsForPsn/' + P(p_));
    },
    GetMembershipIdByDisplayName: function(membershipType, displayName, p_={}) {
      return F(`Destiny/${E(membershipType)}/Stats/GetMembershipIdByDisplayName/${E(displayName)}/` + P(p_));
    },
    GetMyGrimoire: function(membershipType, p_={}) {
      return F(`Destiny/Vanguard/Grimoire/${E(membershipType)}/` + P(p_));
    },
    GetPostGameCarnageReport: function(activityInstanceId, p_={}) {
      return F(`Destiny/Stats/PostGameCarnageReport/${E(activityInstanceId)}/` + P(p_));
    },
    GetPublicAdvisors: function(p_={}) {
      return F('Destiny/Advisors/' + P(p_));
    },
    GetPublicAdvisorsV2: function(p_={}) {
      return F('Destiny/Advisors/V2/' + P(p_));
    },
    GetPublicVendor: function(vendorId, p_={}) {
      return F(`Destiny/Vendors/${E(vendorId)}/` + P(p_));
    },
    GetPublicVendorWithMetadata: function(vendorId, p_={}) {
      return F(`Destiny/Vendors/${E(vendorId)}/Metadata/` + P(p_));
    },
    GetPublicXurVendor: function(p_={}) {
      return F('Destiny/Advisors/Xur/' + P(p_));
    },
    GetRecordBookCompletionStatus: function(membershipType, recordBookHash, p_={}) {
      return F(`Destiny/${E(membershipType)}/MyAccount/RecordBooks/${E(recordBookHash)}/Completion/` + P(p_));
    },
    GetSpecialEventAdvisors: function(p_={}) {
      return F('Destiny/Events/' + P(p_));
    },
    GetTriumphs: function(membershipType, destinyMembershipId, p_={}) {
      return F(`Destiny/${E(membershipType)}/Account/${E(destinyMembershipId)}/Triumphs/` + P(p_));
    },
    GetUniqueWeaponHistory: function(membershipType, destinyMembershipId, characterId, p_={}) {
      return F(`Destiny/Stats/UniqueWeapons/${E(membershipType)}/${E(destinyMembershipId)}/${E(characterId)}/` + P(p_));
    },
    GetVault: function(membershipType, p_={}) {
      return F(`Destiny/${E(membershipType)}/MyAccount/Vault/` + P(p_));
    },
    GetVaultSummary: function(membershipType, p_={}) {
      return F(`Destiny/${E(membershipType)}/MyAccount/Vault/Summary/` + P(p_));
    },
    GetVendorForCurrentCharacter: function(membershipType, characterId, vendorId, p_={}) {
      return F(`Destiny/${E(membershipType)}/MyAccount/Character/${E(characterId)}/Vendor/${E(vendorId)}/` + P(p_));
    },
    GetVendorForCurrentCharacterWithMetadata: function(membershipType, characterId, vendorId, p_={}) {
      return F(`Destiny/${E(membershipType)}/MyAccount/Character/${E(characterId)}/Vendor/${E(vendorId)}/Metadata/` + P(p_));
    },
    GetVendorItemDetailForCurrentCharacter: function(membershipType, characterId, vendorId, itemId, p_={}) {
      return F(`Destiny/${E(membershipType)}/MyAccount/Character/${E(characterId)}/Vendor/${E(vendorId)}/Item/${E(itemId)}/` + P(p_));
    },
    GetVendorItemDetailForCurrentCharacterWithMetadata: function(membershipType, characterId, vendorId, itemId, p_={}) {
      return F(`Destiny/${E(membershipType)}/MyAccount/Character/${E(characterId)}/Vendor/${E(vendorId)}/Item/${E(itemId)}/Metadata/` + P(p_));
    },
    GetVendorSummariesForCurrentCharacter: function(membershipType, characterId, p_={}) {
      return F(`Destiny/${E(membershipType)}/MyAccount/Character/${E(characterId)}/Vendors/Summaries/` + P(p_));
    },
    RefundItem: function(param1, p_={}) {
      return F(`Destiny/${E(param1)}/RefundItem/` + P(p_));
    },
    SearchDestinyPlayer: function(membershipType, displayName, p_={}) {
      return F(`Destiny/SearchDestinyPlayer/${E(membershipType)}/${E(displayName)}/` + P(p_));
    },
    SetItemLockState: function(p_={}) {
      return F('Destiny/SetLockState/' + P(p_));
    },
    SetQuestTrackedState: function(p_={}) {
      return F('Destiny/SetQuestTrackedState/' + P(p_));
    },
    TransferItem: function(p_={}) {
      return F('Destiny/TransferItem/' + P(p_));
    },
  },
  ExternalSocialService: {
    GetAggregatedSocialFeed: function(param1, p_={}) {
      return F(`ExternalSocial/GetAggregatedSocialFeed/${E(param1)}/` + P(p_));
    },
  },
  ForumService: {
    ApproveFireteamThread: function(param1, p_={}) {
      return F(`Forum/Recruit/Approve/${E(param1)}/` + P(p_));
    },
    ChangeLockState: function(param1, param2, p_={}) {
      return F(`Forum/ChangeLockState/${E(param1)}/${E(param2)}/` + P(p_));
    },
    ChangePinState: function(param1, param2, p_={}) {
      return F(`Forum/ChangePinState/${E(param1)}/${E(param2)}/` + P(p_));
    },
    CreateContentComment: function(p_={}) {
      return F('Forum/CreateContentComment/' + P(p_));
    },
    CreatePost: function(p_={}) {
      return F('Forum/CreatePost/' + P(p_));
    },
    DeletePost: function(param1, p_={}) {
      return F(`Forum/DeletePost/${E(param1)}/` + P(p_));
    },
    EditPost: function(param1, p_={}) {
      return F(`Forum/EditPost/${E(param1)}/` + P(p_));
    },
    GetCoreTopicsPaged: function(param1, param2, param3, param4, p_={}) {
      return F(`Forum/GetCoreTopicsPaged/${E(param1)}/${E(param2)}/${E(param3)}/${E(param4)}/` + P(p_));
    },
    GetForumTagCountEstimate: function(param1, p_={}) {
      return F(`Forum/GetForumTagCountEstimate/${E(param1)}/` + P(p_));
    },
    GetForumTagSuggestions: function(p_={}) {
      return F('Forum/GetForumTagSuggestions/' + P(p_));
    },
    GetPoll: function(param1, p_={}) {
      return F(`Forum/Poll/${E(param1)}/` + P(p_));
    },
    GetPopularTags: function(p_={}) {
      return F('Forum/GetPopularTags/' + P(p_));
    },
    GetPostAndParent: function(childPostId, p_={}) {
      return F(`Forum/GetPostAndParent/${E(childPostId)}/` + P(p_));
    },
    GetPostAndParentAwaitingApproval: function(childPostId, p_={}) {
      return F(`Forum/GetPostAndParentAwaitingApproval/${E(childPostId)}/` + P(p_));
    },
    GetPostsThreadedPaged: function(parentPostId, page, pageSize, replySize, getParentPost, rootThreadMode, sortMode, p_={}) {
      return F(`Forum/GetPostsThreadedPaged/${E(parentPostId)}/${E(page)}/${E(pageSize)}/${E(replySize)}/${E(getParentPost)}/${E(rootThreadMode)}/${E(sortMode)}/` + P(p_));
    },
    GetPostsThreadedPagedFromChild: function(childPostId, page, pageSize, replySize, rootThreadMode, sortMode, p_={}) {
      return F(`Forum/GetPostsThreadedPagedFromChild/${E(childPostId)}/${E(page)}/${E(pageSize)}/${E(replySize)}/${E(rootThreadMode)}/${E(sortMode)}/` + P(p_));
    },
    GetRecruitmentThreadSummaries: function(p_={}) {
      return F('Forum/Recruit/Summaries/' + P(p_));
    },
    GetTopicForContent: function(contentId, p_={}) {
      return F(`Forum/GetTopicForContent/${E(contentId)}/` + P(p_));
    },
    GetTopicsPaged: function(page, pageSize, group, sort, quickDate, categoryFilter, p_={}) {
      return F(`Forum/GetTopicsPaged/${E(page)}/${E(pageSize)}/${E(group)}/${E(sort)}/${E(quickDate)}/${E(categoryFilter)}/` + P(p_));
    },
    JoinFireteamThread: function(param1, p_={}) {
      return F(`Forum/Recruit/Join/${E(param1)}/` + P(p_));
    },
    KickBanFireteamApplicant: function(param1, param2, p_={}) {
      return F(`Forum/Recruit/KickBan/${E(param1)}/${E(param2)}/` + P(p_));
    },
    LeaveFireteamThread: function(param1, p_={}) {
      return F(`Forum/Recruit/Leave/${E(param1)}/` + P(p_));
    },
    MarkReplyAsAnswer: function(param1, param2, p_={}) {
      return F(`Forum/MarkReplyAsAnswer/${E(param1)}/${E(param2)}/` + P(p_));
    },
    ModerateGroupPost: function(param1, p_={}) {
      return F(`Forum/Post/${E(param1)}/GroupModerate/` + P(p_));
    },
    ModeratePost: function(param1, p_={}) {
      return F(`Forum/Post/${E(param1)}/Moderate/` + P(p_));
    },
    ModerateTag: function(param1, p_={}) {
      return F(`Forum/Tags/${E(param1)}/Moderate/` + P(p_));
    },
    PollVote: function(param1, param2, p_={}) {
      return F(`Forum/Poll/Vote/${E(param1)}/${E(param2)}/` + P(p_));
    },
    RatePost: function(param1, param2, p_={}) {
      return F(`Forum/RatePost/${E(param1)}/${E(param2)}/` + P(p_));
    },
    UnmarkReplyAsAnswer: function(param1, p_={}) {
      return F(`Forum/UnmarkReplyAsAnswer/${E(param1)}/` + P(p_));
    },
  },
  GameService: {
    GetPlayerGamesById: function(param1, p_={}) {
      return F(`Game/GetPlayerGamesById/${E(param1)}/` + P(p_));
    },
    ReachModelSneakerNet: function(param1, p_={}) {
      return F(`Game/ReachModelSneakerNet/${E(param1)}/` + P(p_));
    },
  },
  GroupService: {
    ApproveAllPending: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Members/ApproveAll/` + P(p_));
    },
    ApproveGroupMembership: function(groupId, membershipId, p_={}) {
      return F(`Group/${E(groupId)}/Members/${E(membershipId)}/Approve/` + P(p_));
    },
    ApproveGroupMembershipV2: function(groupId, membershipId, p_={}) {
      return F(`Group/${E(groupId)}/Members/${E(membershipId)}/ApproveV2/` + P(p_));
    },
    ApprovePendingForList: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Members/ApproveList/` + P(p_));
    },
    BanMember: function(groupId, membershipId, p_={}) {
      return F(`Group/${E(groupId)}/Members/${E(membershipId)}/Ban/` + P(p_));
    },
    BreakAlliance: function(groupId, allyGroupId, p_={}) {
      return F(`Group/${E(groupId)}/Relationship/${E(allyGroupId)}/BreakAlliance/` + P(p_));
    },
    BreakAlliances: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/BreakAlliances/` + P(p_));
    },
    CreateGroup: function(p_={}) {
      return F('Group/Create/' + P(p_));
    },
    CreateGroupV2: function(p_={}) {
      return F('Group/Create/V2/' + P(p_));
    },
    CreateMinimalGroup: function(p_={}) {
      return F('Group/Create/Minimal/' + P(p_));
    },
    DenyAllPending: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Members/DenyAll/` + P(p_));
    },
    DenyGroupMembership: function(groupId, membershipId, p_={}) {
      return F(`Group/${E(groupId)}/Members/${E(membershipId)}/Deny/` + P(p_));
    },
    DenyGroupMembershipV2: function(groupId, membershipId, p_={}) {
      return F(`Group/${E(groupId)}/Members/${E(membershipId)}/DenyV2/` + P(p_));
    },
    DenyPendingForList: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Members/DenyList/` + P(p_));
    },
    DisableClanForGroup: function(groupId, clanMembershipType, p_={}) {
      return F(`Group/${E(groupId)}/Clans/Disable/${E(clanMembershipType)}/` + P(p_));
    },
    DisbandAlliance: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/BreakAllAlliances/` + P(p_));
    },
    EditGroup: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Edit/` + P(p_));
    },
    EditGroupMembership: function(groupId, membershipId, groupMembershipType, p_={}) {
      return F(`Group/${E(groupId)}/Members/${E(membershipId)}/SetMembershipType/${E(groupMembershipType)}/` + P(p_));
    },
    EditGroupV2: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/EditV2/` + P(p_));
    },
    EnableClanForGroup: function(groupId, clanMembershipType, p_={}) {
      return F(`Group/${E(groupId)}/Clans/Enable/${E(clanMembershipType)}/` + P(p_));
    },
    FollowGroupsWithGroup: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/FollowList/` + P(p_));
    },
    FollowGroupWithGroup: function(groupId, followGroupId, p_={}) {
      return F(`Group/${E(groupId)}/Follow/${E(followGroupId)}/` + P(p_));
    },
    GetAdminsOfGroup: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Admins/` + P(p_));
    },
    GetAdminsOfGroupV2: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/AdminsV2/` + P(p_));
    },
    GetAllFoundedGroupsForMember: function(param1, p_={}) {
      return F(`Group/User/${E(param1)}/Founded/All/` + P(p_));
    },
    GetAllGroupsForCurrentMember: function(p_={}) {
      return F('Group/MyGroups/All/' + P(p_));
    },
    GetAllGroupsForMember: function(membershipId, p_={}) {
      return F(`Group/User/${E(membershipId)}/All/` + P(p_));
    },
    GetAlliedGroups: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Allies/` + P(p_));
    },
    GetAvailableAvatars: function(p_={}) {
      return F('Group/GetAvailableAvatars/' + P(p_));
    },
    GetAvailableThemes: function(p_={}) {
      return F('Group/GetAvailableThemes/' + P(p_));
    },
    GetBannedMembersOfGroup: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Banned/` + P(p_));
    },
    GetBannedMembersOfGroupV2: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/BannedV2/` + P(p_));
    },
    GetClanAttributeDefinitions: function(p_={}) {
      return F('Group/GetClanAttributeDefinitions/' + P(p_));
    },
    GetDeletedGroupsForCurrentMember: function(p_={}) {
      return F('Group/MyGroups/Deleted/' + P(p_));
    },
    GetFoundedGroupsForMember: function(membershipId, currentPage, p_={}) {
      return F(`Group/User/${E(membershipId)}/Founded/${E(currentPage)}/` + P(p_));
    },
    GetGroup: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/` + P(p_));
    },
    GetGroupByName: function(groupName, p_={}) {
      return F(`Group/Name/${E(groupName)}/` + P(p_));
    },
    GetGroupsFollowedByGroup: function(groupId, currentPage, p_={}) {
      return F(`Group/${E(groupId)}/Following/${E(currentPage)}/` + P(p_));
    },
    GetGroupsFollowingGroup: function(groupId, currentPage, p_={}) {
      return F(`Group/${E(groupId)}/FollowedBy/${E(currentPage)}/` + P(p_));
    },
    GetGroupTagSuggestions: function(p_={}) {
      return F('Group/GetGroupTagSuggestions/' + P(p_));
    },
    GetJoinedGroupsForCurrentMember: function(p_={}) {
      return F('Group/MyGroups/' + P(p_));
    },
    GetJoinedGroupsForCurrentMemberV2: function(currentPage, p_={}) {
      return F(`Group/MyGroups/V2/${E(currentPage)}/` + P(p_));
    },
    GetJoinedGroupsForMember: function(membershipId, p_={}) {
      return F(`Group/User/${E(membershipId)}/` + P(p_));
    },
    GetJoinedGroupsForMemberV2: function(membershipId, currentPage, p_={}) {
      return F(`Group/User/${E(membershipId)}/Joined/${E(currentPage)}/` + P(p_));
    },
    GetJoinedGroupsForMemberV3: function(membershipId, currentPage, p_={}) {
      return F(`Group/User/${E(membershipId)}/JoinedV3/${E(currentPage)}/` + P(p_));
    },
    GetMembersOfClan: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/ClanMembers/` + P(p_));
    },
    GetMembersOfGroup: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Members/` + P(p_));
    },
    GetMembersOfGroupV2: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/MembersV2/` + P(p_));
    },
    GetMembersOfGroupV3: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/MembersV3/` + P(p_));
    },
    GetMyClanMemberships: function(p_={}) {
      return F('Group/MyClans/' + P(p_));
    },
    GetPendingClanMemberships: function(groupId, clanMembershipType, currentPage, p_={}) {
      return F(`Group/${E(groupId)}/Clan/${E(clanMembershipType)}/Pending/${E(currentPage)}/` + P(p_));
    },
    GetPendingGroupsForCurrentMember: function(p_={}) {
      return F('Group/MyPendingGroups/' + P(p_));
    },
    GetPendingGroupsForCurrentMemberV2: function(currentPage, p_={}) {
      return F(`Group/MyPendingGroups/V2/${E(currentPage)}/` + P(p_));
    },
    GetPendingGroupsForMember: function(membershipId, p_={}) {
      return F(`Group/User/${E(membershipId)}/Pending/` + P(p_));
    },
    GetPendingGroupsForMemberV2: function(membershipId, currentPage, p_={}) {
      return F(`Group/User/${E(membershipId)}/PendingV2/${E(currentPage)}/` + P(p_));
    },
    GetPendingMemberships: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Members/Pending/` + P(p_));
    },
    GetPendingMembershipsV2: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Members/PendingV2/` + P(p_));
    },
    GetRecommendedGroups: function(p_={}) {
      return F('Group/Recommended/' + P(p_));
    },
    GroupSearch: function(p_={}) {
      return F('Group/Search/' + P(p_));
    },
    InviteClanMember: function(groupId, membershipId, clanMembershipType, p_={}) {
      return F(`Group/${E(groupId)}/InviteToClan/${E(membershipId)}/${E(clanMembershipType)}/` + P(p_));
    },
    InviteGroupMember: function(groupId, membershipId, p_={}) {
      return F(`Group/${E(groupId)}/Invite/${E(membershipId)}/` + P(p_));
    },
    InviteManyToJoinAlliance: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Allies/InviteMany/` + P(p_));
    },
    InviteToJoinAlliance: function(groupId, allyGroupId, p_={}) {
      return F(`Group/${E(groupId)}/Allies/Invite/${E(allyGroupId)}/` + P(p_));
    },
    JoinClanForGroup: function(groupId, clanMembershipType, p_={}) {
      return F(`Group/${E(groupId)}/Clans/Join/${E(clanMembershipType)}/` + P(p_));
    },
    KickMember: function(groupId, membershipId, p_={}) {
      return F(`Group/${E(groupId)}/Members/${E(membershipId)}/Kick/` + P(p_));
    },
    LeaveClanForGroup: function(groupId, clanMembershipType, p_={}) {
      return F(`Group/${E(groupId)}/Clans/Leave/${E(clanMembershipType)}/` + P(p_));
    },
    Migrate: function(param1, param2, param3, p_={}) {
      return F(`Group/${E(param1)}/Migrate/${E(param2)}/${E(param3)}/` + P(p_));
    },
    OverrideFounderAdmin: function(groupId, membershipType, p_={}) {
      return F(`Group/${E(groupId)}/Admin/FounderOverride/${E(membershipType)}/` + P(p_));
    },
    RefreshClanSettingsInDestiny: function(clanMembershipType, p_={}) {
      return F(`Group/MyClans/Refresh/${E(clanMembershipType)}/` + P(p_));
    },
    RequestGroupMembership: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Members/Apply/` + P(p_));
    },
    RequestGroupMembershipV2: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Members/ApplyV2/` + P(p_));
    },
    RequestToJoinAlliance: function(groupId, allyGroupId, p_={}) {
      return F(`Group/${E(groupId)}/Allies/RequestToJoin/${E(allyGroupId)}/` + P(p_));
    },
    RescindGroupMembership: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Members/Rescind/` + P(p_));
    },
    SetGroupAsAlliance: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/SetAsAlliance/` + P(p_));
    },
    SetPrivacy: function(groupId, param2, p_={}) {
      return F(`Group/${E(groupId)}/Privacy/${E(param2)}/` + P(p_));
    },
    UnbanMember: function(groupId, membershipId, p_={}) {
      return F(`Group/${E(groupId)}/Members/${E(membershipId)}/Unban/` + P(p_));
    },
    UndeleteGroup: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/Undelete/` + P(p_));
    },
    UnfollowAllGroupsWithGroup: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/UnfollowAll/` + P(p_));
    },
    UnfollowGroupsWithGroup: function(groupId, p_={}) {
      return F(`Group/${E(groupId)}/UnfollowList/` + P(p_));
    },
    UnfollowGroupWithGroup: function(groupId, followGroupId, p_={}) {
      return F(`Group/${E(groupId)}/Unfollow/${E(followGroupId)}/` + P(p_));
    },
  },
  IgnoreService: {
    FlagItem: function(p_={}) {
      return F('Ignore/Flag/' + P(p_));
    },
    GetIgnoresForUser: function(p_={}) {
      return F('Ignore/MyIgnores/' + P(p_));
    },
    GetIgnoreStatusForPost: function(param1, p_={}) {
      return F(`Ignore/MyIgnores/Posts/${E(param1)}/` + P(p_));
    },
    GetIgnoreStatusForUser: function(param1, p_={}) {
      return F(`Ignore/MyIgnores/Users/${E(param1)}/` + P(p_));
    },
    GetReportContext: function(param1, p_={}) {
      return F(`Ignore/ReportContext/${E(param1)}/` + P(p_));
    },
    IgnoreItem: function(p_={}) {
      return F('Ignore/Ignore/' + P(p_));
    },
    MyLastReport: function(p_={}) {
      return F('Ignore/MyLastReport/' + P(p_));
    },
    UnignoreItem: function(p_={}) {
      return F('Ignore/Unignore/' + P(p_));
    },
  },
  JSONPService: {
    GetCurrentUser: function(p_={}) {
      return F('JSONP/GetBungieNetUser/' + P(p_));
    },
  },
  MessageService: {
    CreateConversation: function(p_={}) {
      return F('Message/CreateConversation/' + P(p_));
    },
    CreateConversationV2: function(p_={}) {
      return F('Message/CreateConversationV2/' + P(p_));
    },
    GetAllianceInvitedToJoinInvitations: function(param1, param2, p_={}) {
      return F(`Message/AllianceInvitations/InvitationsToJoinAnotherGroup/${E(param1)}/${E(param2)}/` + P(p_));
    },
    GetAllianceJoinInvitations: function(param1, param2, p_={}) {
      return F(`Message/AllianceInvitations/RequestsToJoinYourGroup/${E(param1)}/${E(param2)}/` + P(p_));
    },
    GetConversationById: function(conversationId, p_={}) {
      return F(`Message/GetConversationById/${E(conversationId)}/` + P(p_));
    },
    GetConversationByIdV2: function(param1, p_={}) {
      return F(`Message/GetConversationByIdV2/${E(param1)}/` + P(p_));
    },
    GetConversationsV2: function(param1, param2, p_={}) {
      return F(`Message/GetConversationsV2/${E(param1)}/${E(param2)}/` + P(p_));
    },
    GetConversationsV3: function(param1, param2, p_={}) {
      return F(`Message/GetConversationsV3/${E(param1)}/${E(param2)}/` + P(p_));
    },
    GetConversationsV4: function(param1, p_={}) {
      return F(`Message/GetConversationsV4/${E(param1)}/` + P(p_));
    },
    GetConversationsV5: function(currentPage, p_={}) {
      return F(`Message/GetConversationsV5/${E(currentPage)}/` + P(p_));
    },
    GetConversationThreadV2: function(param1, param2, param3, p_={}) {
      return F(`Message/GetConversationThreadV2/${E(param1)}/${E(param2)}/${E(param3)}/` + P(p_));
    },
    GetConversationThreadV3: function(param1, param2, p_={}) {
      return F(`Message/GetConversationThreadV3/${E(param1)}/${E(param2)}/` + P(p_));
    },
    GetConversationWithMemberId: function(memberId, p_={}) {
      return F(`Message/GetConversationWithMember/${E(memberId)}/` + P(p_));
    },
    GetConversationWithMemberIdV2: function(param1, p_={}) {
      return F(`Message/GetConversationWithMemberV2/${E(param1)}/` + P(p_));
    },
    GetGroupConversations: function(param1, p_={}) {
      return F(`Message/GetGroupConversations/${E(param1)}/` + P(p_));
    },
    GetInvitationDetails: function(param1, p_={}) {
      return F(`Message/Invitations/${E(param1)}/Details/` + P(p_));
    },
    GetTotalConversationCount: function(p_={}) {
      return F('Message/GetTotalConversationCount/' + P(p_));
    },
    GetUnreadConversationCountV2: function(p_={}) {
      return F('Message/GetUnreadPrivateConversationCount/' + P(p_));
    },
    GetUnreadConversationCountV3: function(p_={}) {
      return F('Message/GetUnreadConversationCountV3/' + P(p_));
    },
    GetUnreadConversationCountV4: function(p_={}) {
      return F('Message/GetUnreadConversationCountV4/' + P(p_));
    },
    GetUnreadGroupConversationCount: function(p_={}) {
      return F('Message/GetUnreadGroupConversationCount/' + P(p_));
    },
    LeaveConversation: function(param1, p_={}) {
      return F(`Message/LeaveConversation/${E(param1)}/` + P(p_));
    },
    ModerateGroupWall: function(param1, param2, p_={}) {
      return F(`Message/ModerateGroupWall/${E(param1)}/${E(param2)}/` + P(p_));
    },
    ReviewAllInvitations: function(param1, param2, p_={}) {
      return F(`Message/Invitations/ReviewAllDirect/${E(param1)}/${E(param2)}/` + P(p_));
    },
    ReviewInvitation: function(param1, param2, param3, p_={}) {
      return F(`Message/Invitations/${E(param1)}/${E(param2)}/${E(param3)}/` + P(p_));
    },
    ReviewInvitationDirect: function(invitationId, invitationResponseState, p_={}) {
      return F(`Message/Invitations/ReviewDirect/${E(invitationId)}/${E(invitationResponseState)}/` + P(p_));
    },
    ReviewInvitations: function(param1, p_={}) {
      return F(`Message/Invitations/ReviewListDirect/${E(param1)}/` + P(p_));
    },
    SaveMessageV2: function(p_={}) {
      return F('Message/SaveMessageV2/' + P(p_));
    },
    SaveMessageV3: function(p_={}) {
      return F('Message/SaveMessageV3/' + P(p_));
    },
    SaveMessageV4: function(p_={}) {
      return F('Message/SaveMessageV4/' + P(p_));
    },
    UpdateConversationLastViewedTimestamp: function(p_={}) {
      return F('Message/Conversations/UpdateLastViewedTimestamp/' + P(p_));
    },
    UserIsTyping: function(p_={}) {
      return F('Message/UserIsTyping/' + P(p_));
    },
  },
  NotificationService: {
    GetRealTimeEvents: function(param1, param2, p_={}) {
      return F(`Notification/Events/${E(param1)}/${E(param2)}/` + P(p_));
    },
    GetRecentNotificationCount: function(p_={}) {
      return F('Notification/GetCount/' + P(p_));
    },
    GetRecentNotifications: function(p_={}) {
      return F('Notification/GetRecent/' + P(p_));
    },
    ResetNotification: function(p_={}) {
      return F('Notification/Reset/' + P(p_));
    },
  },
  SurveyService: {
    GetSurvey: function(p_={}) {
      return F('Survey/GetSurvey/' + P(p_));
    },
  },
  TokensService: {
    ApplyOfferToCurrentDestinyMembership: function(param1, param2, p_={}) {
      return F(`Tokens/ApplyOfferToCurrentDestinyMembership/${E(param1)}/${E(param2)}/` + P(p_));
    },
    BreakBond: function(p_={}) {
      return F('Tokens/RAF/BreakBond/' + P(p_));
    },
    ClaimAndApplyOnToken: function(tokenType, p_={}) {
      return F(`Tokens/ClaimAndApplyToken/${E(tokenType)}/` + P(p_));
    },
    ClaimToken: function(p_={}) {
      return F('Tokens/Claim/' + P(p_));
    },
    ConsumeMarketplacePlatformCodeOffer: function(param1, param2, param3, p_={}) {
      return F(`Tokens/ConsumeMarketplacePlatformCodeOffer/${E(param1)}/${E(param2)}/${E(param3)}/` + P(p_));
    },
    GetCurrentUserOfferHistory: function(p_={}) {
      return F('Tokens/OfferHistory/' + P(p_));
    },
    GetCurrentUserThrottleState: function(p_={}) {
      return F('Tokens/ThrottleState/' + P(p_));
    },
    GetRAFEligibility: function(p_={}) {
      return F('Tokens/RAF/GetEligibility/' + P(p_));
    },
    MarketplacePlatformCodeOfferHistory: function(p_={}) {
      return F('Tokens/MarketplacePlatformCodeOfferHistory/' + P(p_));
    },
    RAFClaim: function(p_={}) {
      return F('Tokens/RAF/Claim/' + P(p_));
    },
    RAFGenerateReferralCode: function(param1, p_={}) {
      return F(`Tokens/RAF/GenerateReferralCode/${E(param1)}/` + P(p_));
    },
    RAFGetNewPlayerBondDetails: function(p_={}) {
      return F('Tokens/RAF/GetNewPlayerBondDetails/' + P(p_));
    },
    RAFGetVeteranBondDetails: function(p_={}) {
      return F('Tokens/RAF/GetVeteranBondDetails/' + P(p_));
    },
    VerifyAge: function(p_={}) {
      return F('Tokens/VerifyAge/' + P(p_));
    },
  },
  UserService: {
    CreateUser: function(p_={}) {
      return F('User/CreateUser/' + P(p_));
    },
    EditSuccessMessageFlags: function(param1, p_={}) {
      return F(`User/MessageFlags/Success/Update/${E(param1)}/` + P(p_));
    },
    GetAvailableAvatars: function(p_={}) {
      return F('User/GetAvailableAvatars/' + P(p_));
    },
    GetAvailableAvatarsAdmin: function(param1, p_={}) {
      return F(`User/GetAvailableAvatarsAdmin/${E(param1)}/` + P(p_));
    },
    GetAvailableThemes: function(p_={}) {
      return F('User/GetAvailableThemes/' + P(p_));
    },
    GetBungieAccount: function(membershipId, membershipType, p_={}) {
      return F(`User/GetBungieAccount/${E(membershipId)}/${E(membershipType)}/` + P(p_));
    },
    GetBungieNetUserById: function(membershipId, p_={}) {
      return F(`User/GetBungieNetUserById/${E(membershipId)}/` + P(p_));
    },
    GetCountsForCurrentUser: function(p_={}) {
      return F('User/GetCounts/' + P(p_));
    },
    GetCredentialTypesForAccount: function(p_={}) {
      return F('User/GetCredentialTypesForAccount/' + P(p_));
    },
    GetCurrentBungieAccount: function(p_={}) {
      return F('User/GetCurrentBungieAccount/' + P(p_));
    },
    GetCurrentBungieNetUser: function(p_={}) {
      return F('User/GetCurrentBungieNetUser/' + P(p_));
    },
    GetCurrentUser: function(p_={}) {
      return F('User/GetBungieNetUser/' + P(p_));
    },
    GetMobileAppPairings: function(p_={}) {
      return F('User/GetMobileAppPairings/' + P(p_));
    },
    GetMobileAppPairingsUncached: function(p_={}) {
      return F('User/GetMobileAppPairingsUncached/' + P(p_));
    },
    GetNotificationSettings: function(p_={}) {
      return F('User/GetNotificationSettings/' + P(p_));
    },
    GetPartnerships: function(membershipId, p_={}) {
      return F(`User/${E(membershipId)}/Partnerships/` + P(p_));
    },
    GetPlatformApiKeysForUser: function(p_={}) {
      return F('User/GetPlatformApiKeysForUser/' + P(p_));
    },
    GetSignOutUrl: function(p_={}) {
      return F('User/GetSignOutUrl/' + P(p_));
    },
    GetUserAliases: function(membershipId, p_={}) {
      return F(`User/GetUserAliases/${E(membershipId)}/` + P(p_));
    },
    GetUserMembershipIds: function(p_={}) {
      return F('User/GetMembershipIds/' + P(p_));
    },
    LinkOverride: function(p_={}) {
      return F('User/LinkOverride/' + P(p_));
    },
    RegisterMobileAppPair: function(p_={}) {
      return F('User/RegisterMobileAppPair/' + P(p_));
    },
    RemovePartnership: function(param1, p_={}) {
      return F(`User/Partnerships/${E(param1)}/Remove/` + P(p_));
    },
    SearchUsers: function(p_={}) {
      return F('User/SearchUsers/' + P(p_));
    },
    SearchUsersPaged: function(searchTerm, page, p_={}) {
      return F(`User/SearchUsersPaged/${E(searchTerm)}/${E(page)}/` + P(p_));
    },
    SearchUsersPagedV2: function(searchTerm, page, param3, p_={}) {
      return F(`User/SearchUsersPaged/${E(searchTerm)}/${E(page)}/${E(param3)}/` + P(p_));
    },
    SetAcknowledged: function(ackId, p_={}) {
      return F(`User/Acknowledged/${E(ackId)}/` + P(p_));
    },
    UnregisterMobileAppPair: function(param1, p_={}) {
      return F(`User/UnregisterMobileAppPair/${E(param1)}/` + P(p_));
    },
    UpdateDestinyEmblemAvatar: function(p_={}) {
      return F('User/UpdateDestinyEmblemAvatar/' + P(p_));
    },
    UpdateNotificationSetting: function(p_={}) {
      return F('User/Notification/Update/' + P(p_));
    },
    UpdateStateInfoForMobileAppPair: function(p_={}) {
      return F('User/UpdateStateInfoForMobileAppPair/' + P(p_));
    },
    UpdateUser: function(p_={}) {
      return F('User/UpdateUser/' + P(p_));
    },
    UpdateUserAdmin: function(param1, p_={}) {
      return F(`User/UpdateUserAdmin/${E(param1)}/` + P(p_));
    },
  },
};

})();
