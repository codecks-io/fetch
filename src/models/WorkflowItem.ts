import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {CardVisibility, Checkbox, CheckboxStats, Priority} from "./definitions";
import type {AccountId} from "./Account";
import type {DeckId} from "./Deck";
import type {UserId} from "./User";

export type WorkflowItemId = Nominal<string, "workflowItem">;
/** @experimental `preview` in the Codecks API: may change in any release. */
export const workflowItemDesc = makeModel({
  name: "workflowItem",
  stability: "preview",
  fields: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    accountId: f.belongsTo({stability: "preview"}).type<AccountId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    accountSeq: f.int({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    assigneeId: f.belongsTo({optional: true, stability: "preview"}).type<UserId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    checkboxInfo: f.typed({stability: "preview"}).type<Checkbox[]>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    checkboxStats: f.typed({stability: "preview"}).type<CheckboxStats>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    content: f.string({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    createdAt: f.date({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    creatorId: f.belongsTo({stability: "preview"}).type<UserId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    deckId: f.belongsTo({stability: "preview"}).type<DeckId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    effort: f.int({optional: true, stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    itemId: f.id<WorkflowItemId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    label: f.string({optional: true, stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    lastUpdatedAt: f.date({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    masterTags: f.typed({stability: "preview"}).type<string[]>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    mentionedUsers: f.typed({stability: "preview"}).type<UserId[]>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    priority: f.typed({optional: true, stability: "preview"}).type<Priority>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    sortValue: f.string({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    tags: f.typed({stability: "preview"}).type<string[]>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    targetDeckId: f.belongsTo({optional: true, stability: "preview"}).type<DeckId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    title: f.string({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    version: f.int({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    visibility: f.typed({stability: "preview"}).type<CardVisibility>(),
  },
  relations: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    account: relation("account", {type: "belongsTo", fk: "accountId", stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    assignee: relation("user", {
      type: "belongsTo",
      fk: "assigneeId",
      optional: true,
      stability: "preview",
    }),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    creator: relation("user", {type: "belongsTo", fk: "creatorId", stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    deck: relation("deck", {type: "belongsTo", fk: "deckId", stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    inDeps: relation("workflowItem", {type: "hasMany", fkAsArray: true, stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    outDeps: relation("workflowItem", {type: "hasMany", fkAsArray: true, stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    targetDeck: relation("deck", {
      type: "belongsTo",
      fk: "targetDeckId",
      optional: true,
      stability: "preview",
    }),
  },
  keys: ["itemId"],
});
