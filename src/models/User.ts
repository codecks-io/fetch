
import { makeModel, belongsTo, hasMany, hasOne } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { fileDesc } from "./File";
import { releaseDesc } from "./Release";
import { projectOrderDesc } from "./ProjectOrder";
import { projectSelectionDesc } from "./ProjectSelection";
import { queueSelectionDesc } from "./QueueSelection";
import { accountRoleDesc } from "./AccountRole";
import { cardDiffNotificationDesc } from "./CardDiffNotification";
import { resolvableNotificationDesc } from "./ResolvableNotification";
import { publicProjectMembershipDesc } from "./PublicProjectMembership";
import { lastSeenCardUpvoteDesc } from "./LastSeenCardUpvote";
import { dueCardDesc } from "./DueCard";
import { assigneeDeckAssignmentDesc } from "./AssigneeDeckAssignment";
import { autoFinishedTimeTrackingSegmentDesc } from "./AutoFinishedTimeTrackingSegment";
import { savedSearchDesc } from "./SavedSearch";
import { activityDesc } from "./Activity";
import { userEmailDesc } from "./UserEmail";
import { userTagDesc } from "./UserTag";
import { pinnedMilestoneDesc } from "./PinnedMilestone";
import { projectUserDesc } from "./ProjectUser";
import { userProjectAccessDesc } from "./UserProjectAccess";
import { projectUserSettingDesc } from "./ProjectUserSetting";
import { accountUserSettingDesc } from "./AccountUserSetting";
import { userDismissedHintDesc } from "./UserDismissedHint";
import { integrationDesc } from "./Integration";
import { activeTimeTrackerDesc } from "./ActiveTimeTracker";
import { resolvableParticipantDesc } from "./ResolvableParticipant";
import { cardUpvoteDesc } from "./CardUpvote";
import { userOnboardingDesc } from "./UserOnboarding";

export type UserId = Nominal<string, "user">;
export const userDesc = makeModel("user")
  .fields({
    id: f.id<UserId>(),
    name: f.string(),
    fullName: f.string({ optional: true }),
    timezone: f.string({ optional: true }),
    createdAt: f.date(),
    hasPassword: f.bool(),
    showCardIdInTimer: f.bool(),
    disableMovingImages: f.bool(),
    autoMeFilterCardLimit: f.int({ optional: true }),
    isIntegration: f.bool(),
    statusColorPalette: f.string(),
    wantsNewsletter: f.bool({ optional: true }),
    wantsDailyDigestMail: f.bool({ optional: true }),
    wantsConvoDigestMail: f.bool({ optional: true }),
    disableAnimations: f.bool(),
    enableClickToEditCards: f.bool(),
    cdxRole: f.string(),
    profileImageId: belongsTo("profileImage", () => fileDesc, { optional: true }),
    lastSeenReleaseId: belongsTo("lastSeenRelease", () => releaseDesc),
  })
  .hasMany({
    projectOrders: hasMany(() => projectOrderDesc),
    projectSelections: hasMany(() => projectSelectionDesc),
    queueSelections: hasMany(() => queueSelectionDesc),
    accountRoles: hasMany(() => accountRoleDesc),
    cardDiffNotifications: hasMany(() => cardDiffNotificationDesc),
    resolvableNotifications: hasMany(() => resolvableNotificationDesc),
    publicProjectMembership: hasMany(() => publicProjectMembershipDesc),
    lastSeenCardUpvotes: hasMany(() => lastSeenCardUpvoteDesc),
    dueCards: hasMany(() => dueCardDesc),
    assigneeDeckAssignments: hasMany(() => assigneeDeckAssignmentDesc),
    autoFinishedTimeTrackingSegments: hasMany(() => autoFinishedTimeTrackingSegmentDesc),
    savedSearches: hasMany(() => savedSearchDesc),
    activities: hasMany(() => activityDesc),
    emails: hasMany(() => userEmailDesc),
    tags: hasMany(() => userTagDesc),
    unverifiedEmails: hasMany(() => userEmailDesc),
    primaryEmail: hasOne(() => userEmailDesc),
    pinnedMilestoneNext: hasOne(() => pinnedMilestoneDesc),
    projectAccess: hasMany(() => projectUserDesc),
    explicitProjectAccess: hasMany(() => projectUserDesc),
    withProjectAccess: hasMany(() => userProjectAccessDesc),
    projectSettings: hasMany(() => projectUserSettingDesc),
    accountSettings: hasMany(() => accountUserSettingDesc),
    dismissedHints: hasMany(() => userDismissedHintDesc),
    slackIntegrations: hasMany(() => integrationDesc),
    activeTimeTracker: hasOne(() => activeTimeTrackerDesc),
    participations: hasMany(() => resolvableParticipantDesc),
    upvotes: hasMany(() => cardUpvoteDesc),
    userOnboarding: hasOne(() => userOnboardingDesc),
  })
  .key("id");
