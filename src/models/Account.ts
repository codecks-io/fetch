
import { makeModel, belongsTo, hasMany, hasOne } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { userDesc } from "./User";
import { cardDesc } from "./Card";
import { invoiceDesc } from "./Invoice";
import { cardPresetDesc } from "./CardPreset";
import { attachmentDesc } from "./Attachment";
import { discordGuildDesc } from "./DiscordGuild";
import { timeTrackingSegmentDesc } from "./TimeTrackingSegment";
import { workflowItemDesc } from "./WorkflowItem";
import { deckAssignmentDesc } from "./DeckAssignment";
import { assigneeAssignmentDesc } from "./AssigneeAssignment";
import { assigneeDeckAssignmentDesc } from "./AssigneeDeckAssignment";
import { wizardDesc } from "./Wizard";
import { milestoneDesc } from "./Milestone";
import { sprintDesc } from "./Sprint";
import { sprintConfigDesc } from "./SprintConfig";
import { handCardDesc } from "./HandCard";
import { resolvableDesc } from "./Resolvable";
import { cardUpvoteDesc } from "./CardUpvote";
import { resolvableParticipantDesc } from "./ResolvableParticipant";
import { userReportSettingDesc } from "./UserReportSetting";
import { cardOrderDesc } from "./CardOrder";
import { accountUserAchievementDesc } from "./AccountUserAchievement";
import { userInviteCodeDesc } from "./UserInviteCode";
import { visionBoardDesc } from "./VisionBoard";
import { deckSubscriptionDesc } from "./DeckSubscription";
import { appInstallationDesc } from "./AppInstallation";
import { deckDesc } from "./Deck";
import { queueEntryDesc } from "./QueueEntry";
import { visionBoardQueryDesc } from "./VisionBoardQuery";
import { projectDesc } from "./Project";
import { accountRoleDesc } from "./AccountRole";
import { userInvitationDesc } from "./UserInvitation";
import { integrationDesc } from "./Integration";
import { affiliateCodeDesc } from "./AffiliateCode";
import { activityDesc } from "./Activity";
import { stripeAccountSyncDesc } from "./StripeAccountSync";
import { accountOnboardingDesc } from "./AccountOnboarding";

export type AccountId = Nominal<string, "account">;
export const accountDesc = makeModel("account")
  .fields({
    id: f.id<AccountId>(),
    subdomain: f.string(),
    name: f.string(),
    billingName: f.string({ optional: true }),
    billingLine1: f.string({ optional: true }),
    billingLine2: f.string({ optional: true }),
    billingZip: f.string({ optional: true }),
    billingCity: f.string({ optional: true }),
    billingCountryCode: f.string({ optional: true }),
    billingEmail: f.string({ optional: true }),
    netGiftAmount: f.int(),
    persona: f.string({ optional: true }),
    createdAt: f.date(),
    disabledAt: f.date({ optional: true }),
    totalMediaByteUsage: f.bigint(),
    isDisabled: f.string(),
    milestonesEnabled: f.string(),
    sprintsEnabled: f.string(),
    priorityLabels: f.object<any>(),
    effortScale: f.object<any>(),
    statusChangeDurations: f.object<any>(),
    activeFeatureFlags: f.object<any>(),
    timeTrackingMode: f.string(),
    maxTimeTrackingSegmentMsDuration: f.int(),
    timeTrackingSwimLaneInfo: f.bool(),
    workdays: f.string(),
    workflowMode: f.string(),
    isLearning: f.bool(),
    isNonProfit: f.bool(),
    dependenciesEnabled: f.bool(),
    maxHandSlotCount: f.int(),
    seats: f.int(),
    activeProjectCount: f.int(),
    billingType: f.string(),
    allowInheritHeroCover: f.bool(),
    attachmentCoverMode: f.string(),
    staffPermission: f.string(),
    offeringTrial: f.bool(),
    coupon: f.object<any>({ optional: true }),
    hideCompletedCardCountForDecks: f.bool(),
    visionBoardEnabled: f.bool(),
    fallbackEffort: f.int(),
    timelineScaleType: f.string(),
    startWeekday: f.string(),
    disabledById: belongsTo("disabledBy", () => userDesc, { optional: true }),
  })
  .hasMany({
    cards: hasMany(() => cardDesc),
    invoices: hasMany(() => invoiceDesc),
    cardPresets: hasMany(() => cardPresetDesc),
    attachments: hasMany(() => attachmentDesc),
    discordGuilds: hasMany(() => discordGuildDesc),
    timeTrackingSegments: hasMany(() => timeTrackingSegmentDesc),
    workflowItems: hasMany(() => workflowItemDesc),
    deckAssignments: hasMany(() => deckAssignmentDesc),
    assigneeAssignments: hasMany(() => assigneeAssignmentDesc),
    assigneeDeckAssignments: hasMany(() => assigneeDeckAssignmentDesc),
    wizards: hasMany(() => wizardDesc),
    milestones: hasMany(() => milestoneDesc),
    sprints: hasMany(() => sprintDesc),
    sprintConfigs: hasMany(() => sprintConfigDesc),
    handCards: hasMany(() => handCardDesc),
    resolvables: hasMany(() => resolvableDesc),
    cardUpvotes: hasMany(() => cardUpvoteDesc),
    resolvableParticipants: hasMany(() => resolvableParticipantDesc),
    userReportSettings: hasMany(() => userReportSettingDesc),
    cardOrders: hasMany(() => cardOrderDesc),
    accountUserAchievements: hasMany(() => accountUserAchievementDesc),
    userInviteCodes: hasMany(() => userInviteCodeDesc),
    visionBoards: hasMany(() => visionBoardDesc),
    deckSubscriptions: hasMany(() => deckSubscriptionDesc),
    appInstallations: hasMany(() => appInstallationDesc),
    decks: hasMany(() => deckDesc),
    queueEntries: hasMany(() => queueEntryDesc),
    visionBoardQueries: hasMany(() => visionBoardQueryDesc),
    anyDecks: hasMany(() => deckDesc),
    projects: hasMany(() => projectDesc),
    archivedProjects: hasMany(() => projectDesc),
    anyProjects: hasMany(() => projectDesc),
    roles: hasMany(() => accountRoleDesc),
    invitations: hasMany(() => userInvitationDesc),
    githubIntegration: hasOne(() => integrationDesc),
    slackIntegration: hasOne(() => integrationDesc),
    affiliateCodes: hasMany(() => affiliateCodeDesc),
    activities: hasMany(() => activityDesc),
    stripeAccountSync: hasOne(() => stripeAccountSyncDesc),
    accountOnboarding: hasOne(() => accountOnboardingDesc),
  })
  .key("id");
