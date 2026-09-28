import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {CardVisibility, Checkbox, CheckboxStats, DerivedStatus, Priority} from "./definitions";
import type {AccountId} from "./Account";
import type {DeckId} from "./Deck";
import type {FileId} from "./File";
import type {MilestoneId} from "./Milestone";
import type {SprintId} from "./Sprint";
import type {UserId} from "./User";
import type {WorkflowItemId} from "./WorkflowItem";

export type CardId = Nominal<string, "card">;
export const cardDesc = makeModel({
  name: "card",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    accountSeq: f.int({}),
    assigneeId: f.belongsTo({optional: true}).type<UserId>(),
    cardId: f.id<CardId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    checkboxInfo: f.typed({stability: "preview"}).type<Checkbox[]>(),
    checkboxStats: f.typed({}).type<CheckboxStats>(),
    content: f.string({}),
    coverFileId: f.belongsTo({optional: true}).type<FileId>(),
    createdAt: f.date({}),
    creatorId: f.belongsTo({optional: true}).type<UserId>(),
    deckId: f.belongsTo({optional: true}).type<DeckId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    derivedStatus: f.typed({stability: "preview"}).type<DerivedStatus>(),
    dueDate: f.day({optional: true}),
    effort: f.int({optional: true}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    hasBlockingDeps: f.bool({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    isBlockingDep: f.bool({stability: "preview"}),
    isDoc: f.bool({optional: true}),
    lastUpdatedAt: f.date({}),
    masterTags: f.typed({}).type<string[]>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    mentionedUsers: f.typed({stability: "preview"}).type<UserId[]>(),
    milestoneId: f.belongsTo({optional: true}).type<MilestoneId>(),
    parentCardId: f.belongsTo({optional: true}).type<CardId>(),
    priority: f.typed({optional: true}).type<Priority>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    sourceWorkflowItemId: f
      .belongsTo({optional: true, stability: "preview"})
      .type<WorkflowItemId>(),
    sprintId: f.belongsTo({optional: true}).type<SprintId>(),
    status: f.typed({}).type<"not_started" | "started" | "snoozing" | "done" | (string & {})>(),
    tags: f.typed({}).type<string[]>(),
    title: f.string({}),
    version: f.int({}),
    visibility: f.typed({}).type<CardVisibility>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    assignee: relation("user", {type: "belongsTo", fk: "assigneeId", optional: true}),
    attachments: relation("attachment", {type: "hasMany", fkAsArray: true}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    cardReferences: relation("card", {type: "hasMany", fkAsArray: true, stability: "preview"}),
    childCards: relation("card", {type: "hasMany", fkAsArray: true}),
    coverFile: relation("file", {type: "belongsTo", fk: "coverFileId", optional: true}),
    creator: relation("user", {type: "belongsTo", fk: "creatorId", optional: true}),
    deck: relation("deck", {type: "belongsTo", fk: "deckId", optional: true}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    diffs: relation("cardHistory", {type: "hasMany", stability: "preview"}),
    handCards: relation("handCard", {type: "hasMany"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    inDeps: relation("card", {type: "hasMany", fkAsArray: true, stability: "preview"}),
    milestone: relation("milestone", {type: "belongsTo", fk: "milestoneId", optional: true}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    outDeps: relation("card", {type: "hasMany", fkAsArray: true, stability: "preview"}),
    parentCard: relation("card", {type: "belongsTo", fk: "parentCardId", optional: true}),
    queueEntries: relation("queueEntry", {type: "hasMany"}),
    resolvableEntries: relation("resolvableEntry", {type: "hasMany"}),
    resolvables: relation("resolvable", {type: "hasMany"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    sourceWorkflowItem: relation("workflowItem", {
      type: "belongsTo",
      fk: "sourceWorkflowItemId",
      optional: true,
      stability: "preview",
    }),
    sprint: relation("sprint", {type: "belongsTo", fk: "sprintId", optional: true}),
  },
  keys: ["cardId"],
});
