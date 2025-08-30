
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type AccountId } from "./Account";
import { type DeckId } from "./Deck";
import { type UserId } from "./User";

export type WorkflowItemId = Nominal<string, "workflowItem">;
export const workflowItemDesc = makeModel({
  name: "workflowItem",
  fields: {
    itemId: f.id<WorkflowItemId>(),
    version: f.string({}),
    sortOrder: f.string({}),
    sortValue: f.string({}),
    priority: f.string({ optional: true }),
    content: f.string({}),
    createdAt: f.date({}),
    lastUpdatedAt: f.date({}),
    tags: f.array({}),
    masterTags: f.array({}),
    mentionedUsers: f.array({}),
    title: f.string({}),
    effort: f.int({ optional: true }),
    label: f.string({ optional: true }),
    checkboxStats: f.object({}),
    accountSeq: f.int({}),
    checkboxInfo: f.array({}),
    visibility: f.string({}),
    accountId: f.belongsTo({}).type<AccountId>(),
    deckId: f.belongsTo({}).type<DeckId>(),
    targetDeckId: f.belongsTo({ optional: true }).type<DeckId>(),
    assigneeId: f.belongsTo({ optional: true }).type<UserId>(),
    creatorId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    deck: relation("deck", { type: "belongsTo", fk: "deckId" }),
    targetDeck: relation("deck", { type: "belongsTo", fk: "targetDeckId" }),
    assignee: relation("user", { type: "belongsTo", fk: "assigneeId" }),
    creator: relation("user", { type: "belongsTo", fk: "creatorId" }),
    diffs: relation("workflowItemHistory", { type: "hasMany" }),
    inDeps: relation("workflowItem", { type: "hasMany" }),
    outDeps: relation("workflowItem", { type: "hasMany" }),
  },
  keys: ["itemId"]
})