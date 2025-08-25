
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type AccountId } from "./Account";
import { type DeckId } from "./Deck";
import { type UserId } from "./User";
import { type MilestoneId } from "./Milestone";
import { type SprintId } from "./Sprint";
import { type ProjectId } from "./Project";
import { type FileId } from "./File";
import { type WorkflowItemId } from "./WorkflowItem";
import { type DiscordGuildId } from "./DiscordGuild";
import { type VisionBoardId } from "./VisionBoard";

export type CardId = Nominal<string, "card">;
export const cardDesc = makeModel({
  name: "card",
  fields: {
    cardId: f.id<CardId>(),
    version: f.int({}),
    accountSeq: f.int({}),
    content: f.string({}),
    status: f.string({}),
    derivedStatus: f.string({}),
    createdAt: f.date({}),
    lastUpdatedAt: f.date({}),
    tags: f.array({}),
    masterTags: f.array({}),
    mentionedUsers: f.array({}),
    title: f.string({}),
    priority: f.string({ optional: true }),
    effort: f.int({ optional: true }),
    checkboxStats: f.object({}),
    checkboxInfo: f.array({}),
    visibility: f.string({}),
    legacyProjectSeq: f.int({ optional: true }),
    meta: f.object({}),
    embeds: f.object({}),
    isPublic: f.bool({}),
    hasBlockingDeps: f.bool({}),
    dueDate: f.day({ optional: true }),
    isDoc: f.bool({ optional: true }),
    childCardInfo: f.string({}),
    accountId: f.belongsTo().type<AccountId>(),
    deckId: f.belongsTo({ optional: true }).type<DeckId>(),
    assigneeId: f.belongsTo({ optional: true }).type<UserId>(),
    creatorId: f.belongsTo({ optional: true }).type<UserId>(),
    milestoneId: f.belongsTo({ optional: true }).type<MilestoneId>(),
    sprintId: f.belongsTo({ optional: true }).type<SprintId>(),
    legacyProjectId: f.belongsTo({ optional: true }).type<ProjectId>(),
    coverFileId: f.belongsTo({ optional: true }).type<FileId>(),
    parentCardId: f.belongsTo({ optional: true }).type<CardId>(),
    sourceWorkflowItemId: f.belongsTo({ optional: true }).type<WorkflowItemId>(),
    discordGuildId: f.belongsTo({}).type<DiscordGuildId>(),
    visionBoardId: f.belongsTo({ optional: true }).type<VisionBoardId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    deck: relation("deck", { type: "belongsTo", fk: "deckId" }),
    assignee: relation("user", { type: "belongsTo", fk: "assigneeId" }),
    creator: relation("user", { type: "belongsTo", fk: "creatorId" }),
    milestone: relation("milestone", { type: "belongsTo", fk: "milestoneId" }),
    sprint: relation("sprint", { type: "belongsTo", fk: "sprintId" }),
    legacyProject: relation("project", { type: "belongsTo", fk: "legacyProjectId" }),
    coverFile: relation("file", { type: "belongsTo", fk: "coverFileId" }),
    parentCard: relation("card", { type: "belongsTo", fk: "parentCardId" }),
    sourceWorkflowItem: relation("workflowItem", { type: "belongsTo", fk: "sourceWorkflowItemId" }),
    discordGuild: relation("discordGuild", { type: "belongsTo", fk: "discordGuildId" }),
    visionBoard: relation("visionBoard", { type: "belongsTo", fk: "visionBoardId" }),
    resolvables: relation("resolvable", { type: "hasMany" }),
    handCards: relation("handCard", { type: "hasMany" }),
    timeTrackingSegments: relation("timeTrackingSegment", { type: "hasMany" }),
    cardSubscriptions: relation("cardSubscription", { type: "hasMany" }),
    cardOrders: relation("cardOrder", { type: "hasMany" }),
    resolvableEntries: relation("resolvableEntry", { type: "hasMany" }),
    queueEntries: relation("queueEntry", { type: "hasMany" }),
    attachments: relation("attachment", { type: "hasMany" }),
    diffs: relation("cardHistory", { type: "hasMany" }),
    totalTimeTrackingSums: relation("timeTrackingSum", { type: "hasOne" }),
    userTimeTrackingSums: relation("timeTrackingSum", { type: "hasMany" }),
    childCards: relation("card", { type: "hasMany" }),
    inDeps: relation("card", { type: "hasMany" }),
    outDeps: relation("card", { type: "hasMany" }),
    cardReferences: relation("card", { type: "hasMany" }),
    upvotes: relation("cardUpvote", { type: "hasMany" }),
  },
  keys: ["cardId"]
})