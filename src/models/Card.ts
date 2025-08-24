
import { makeModel, belongsTo, hasMany, hasOne } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { deckDesc } from "./Deck";
import { userDesc } from "./User";
import { milestoneDesc } from "./Milestone";
import { sprintDesc } from "./Sprint";
import { projectDesc } from "./Project";
import { fileDesc } from "./File";
import { workflowItemDesc } from "./WorkflowItem";
import { discordGuildDesc } from "./DiscordGuild";
import { visionBoardDesc } from "./VisionBoard";
import { resolvableDesc } from "./Resolvable";
import { handCardDesc } from "./HandCard";
import { timeTrackingSegmentDesc } from "./TimeTrackingSegment";
import { cardSubscriptionDesc } from "./CardSubscription";
import { cardOrderDesc } from "./CardOrder";
import { resolvableEntryDesc } from "./ResolvableEntry";
import { queueEntryDesc } from "./QueueEntry";
import { attachmentDesc } from "./Attachment";
import { cardHistoryDesc } from "./CardHistory";
import { timeTrackingSumDesc } from "./TimeTrackingSum";
import { cardUpvoteDesc } from "./CardUpvote";

export type CardId = Nominal<string, "card">;
export const cardDesc = makeModel("card")
  .fields({
    cardId: f.id<CardId>(),
    version: f.int(),
    accountSeq: f.int(),
    content: f.string(),
    status: f.string(),
    derivedStatus: f.string(),
    createdAt: f.date(),
    lastUpdatedAt: f.date(),
    tags: f.array<any>(),
    masterTags: f.array<any>(),
    mentionedUsers: f.array<any>(),
    title: f.string(),
    priority: f.string({ optional: true }),
    effort: f.int({ optional: true }),
    checkboxStats: f.object<any>(),
    checkboxInfo: f.array<any>(),
    visibility: f.string(),
    legacyProjectSeq: f.int({ optional: true }),
    meta: f.object<any>(),
    embeds: f.object<any>(),
    isPublic: f.bool(),
    hasBlockingDeps: f.bool(),
    dueDate: f.day({ optional: true }),
    isDoc: f.bool({ optional: true }),
    childCardInfo: f.string(),
    accountId: belongsTo("account", () => accountDesc),
    deckId: belongsTo("deck", () => deckDesc, { optional: true }),
    assigneeId: belongsTo("assignee", () => userDesc, { optional: true }),
    creatorId: belongsTo("creator", () => userDesc, { optional: true }),
    milestoneId: belongsTo("milestone", () => milestoneDesc, { optional: true }),
    sprintId: belongsTo("sprint", () => sprintDesc, { optional: true }),
    legacyProjectId: belongsTo("legacyProject", () => projectDesc, { optional: true }),
    coverFileId: belongsTo("coverFile", () => fileDesc, { optional: true }),
    parentCardId: belongsTo("parentCard", () => cardDesc, { optional: true }),
    sourceWorkflowItemId: belongsTo("sourceWorkflowItem", () => workflowItemDesc, { optional: true }),
    discordGuildId: belongsTo("discordGuild", () => discordGuildDesc),
    visionBoardId: belongsTo("visionBoard", () => visionBoardDesc, { optional: true }),
  })
  .hasMany({
    resolvables: hasMany(() => resolvableDesc),
    handCards: hasMany(() => handCardDesc),
    timeTrackingSegments: hasMany(() => timeTrackingSegmentDesc),
    cardSubscriptions: hasMany(() => cardSubscriptionDesc),
    cardOrders: hasMany(() => cardOrderDesc),
    resolvableEntries: hasMany(() => resolvableEntryDesc),
    queueEntries: hasMany(() => queueEntryDesc),
    attachments: hasMany(() => attachmentDesc),
    diffs: hasMany(() => cardHistoryDesc),
    totalTimeTrackingSums: hasOne(() => timeTrackingSumDesc),
    userTimeTrackingSums: hasMany(() => timeTrackingSumDesc),
    childCards: hasMany(() => cardDesc),
    inDeps: hasMany(() => cardDesc),
    outDeps: hasMany(() => cardDesc),
    cardReferences: hasMany(() => cardDesc),
    upvotes: hasMany(() => cardUpvoteDesc),
  })
  .key("cardId");
