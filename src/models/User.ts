
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type FileId } from "./File";
import { type ReleaseId } from "./Release";

export type UserId = Nominal<string, "user">;
export const userDesc = makeModel({
  name: "user",
  fields: {
    id: f.id<UserId>(),
    name: f.string({}),
    fullName: f.string({ optional: true }),
    timezone: f.string({ optional: true }),
    createdAt: f.date({}),
    hasPassword: f.bool({}),
    showCardIdInTimer: f.bool({}),
    disableMovingImages: f.bool({}),
    autoMeFilterCardLimit: f.int({ optional: true }),
    isIntegration: f.bool({}),
    statusColorPalette: f.string({}),
    wantsNewsletter: f.bool({ optional: true }),
    wantsDailyDigestMail: f.bool({ optional: true }),
    wantsConvoDigestMail: f.bool({ optional: true }),
    disableAnimations: f.bool({}),
    enableClickToEditCards: f.bool({}),
    cdxRole: f.string({}),
    profileImageId: f.belongsTo({ optional: true }).type<FileId>(),
    lastSeenReleaseId: f.belongsTo({}).type<ReleaseId>(),
  },
  relations: {
    profileImage: relation("file", { type: "belongsTo", fk: "profileImageId" }),
    lastSeenRelease: relation("release", { type: "belongsTo", fk: "lastSeenReleaseId" }),
    projectOrders: relation("projectOrder", { type: "hasMany" }),
    projectSelections: relation("projectSelection", { type: "hasMany" }),
    queueSelections: relation("queueSelection", { type: "hasMany" }),
    accountRoles: relation("accountRole", { type: "hasMany" }),
    cardDiffNotifications: relation("cardDiffNotification", { type: "hasMany" }),
    resolvableNotifications: relation("resolvableNotification", { type: "hasMany" }),
    publicProjectMembership: relation("publicProjectMembership", { type: "hasMany" }),
    lastSeenCardUpvotes: relation("lastSeenCardUpvote", { type: "hasMany" }),
    dueCards: relation("dueCard", { type: "hasMany" }),
    assigneeDeckAssignments: relation("assigneeDeckAssignment", { type: "hasMany" }),
    autoFinishedTimeTrackingSegments: relation("autoFinishedTimeTrackingSegment", { type: "hasMany" }),
    savedSearches: relation("savedSearch", { type: "hasMany" }),
    activities: relation("activity", { type: "hasMany" }),
    emails: relation("userEmail", { type: "hasMany" }),
    tags: relation("userTag", { type: "hasMany" }),
    unverifiedEmails: relation("userEmail", { type: "hasMany" }),
    primaryEmail: relation("userEmail", { type: "hasOne" }),
    pinnedMilestoneNext: relation("pinnedMilestone", { type: "hasOne" }),
    projectAccess: relation("projectUser", { type: "hasMany" }),
    explicitProjectAccess: relation("projectUser", { type: "hasMany" }),
    withProjectAccess: relation("userProjectAccess", { type: "hasMany" }),
    projectSettings: relation("projectUserSetting", { type: "hasMany" }),
    accountSettings: relation("accountUserSetting", { type: "hasMany" }),
    dismissedHints: relation("userDismissedHint", { type: "hasMany" }),
    slackIntegrations: relation("integration", { type: "hasMany" }),
    activeTimeTracker: relation("activeTimeTracker", { type: "hasOne" }),
    participations: relation("resolvableParticipant", { type: "hasMany" }),
    upvotes: relation("cardUpvote", { type: "hasMany" }),
    userOnboarding: relation("userOnboarding", { type: "hasOne" }),
  },
  keys: ["id"]
})