import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {CardVisibility, Checkbox, CheckboxStats, Priority} from "./definitions";
import type {AccountId} from "./Account";
import type {DeckId} from "./Deck";
import type {UserId} from "./User";

export type WorkflowItemId = Nominal<string, "workflowItem">;
/**
 * A Journey Step: a template for a sub card. Starting a deck's journey on a card creates a sub card
 * from each of its steps.
 * @experimental `preview` in the Codecks API: may change in any release.
 */
export const workflowItemDesc = makeModel({
  name: "workflowItem",
  stability: "preview",
  fields: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    accountId: f.belongsTo({stability: "preview"}).type<AccountId>(),
    /**
     * The step's number within the organization. It comes from the same counter as
     * `card.accountSeq`.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    accountSeq: f.int({stability: "preview"}),
    /**
     * The owner of the created card.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    assigneeId: f.belongsTo({optional: true, stability: "preview"}).type<UserId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    checkboxInfo: f.typed({stability: "preview"}).type<Checkbox[]>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    checkboxStats: f.typed({stability: "preview"}).type<CheckboxStats>(),
    /**
     * Markdown for the created card's `content`, see `card.content`. `%PARENT_TITLE%` is replaced
     * by the title of the card the journey is started on.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    content: f.string({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    createdAt: f.date({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    creatorId: f.belongsTo({stability: "preview"}).type<UserId>(),
    /**
     * The deck whose journey the step belongs to.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    deckId: f.belongsTo({stability: "preview"}).type<DeckId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    effort: f.int({optional: true, stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    itemId: f.id<WorkflowItemId>(),
    /**
     * The name of the group the step is in. `null` for the default group.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    label: f.string({optional: true, stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    lastUpdatedAt: f.date({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    masterTags: f.typed({stability: "preview"}).type<string[]>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    mentionedUsers: f.typed({stability: "preview"}).type<UserId[]>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    priority: f.typed({optional: true, stability: "preview"}).type<Priority>(),
    /**
     * Steps are ordered by ascending `sortValue`, compared as strings, within their `label` group.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    sortValue: f.string({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    tags: f.typed({stability: "preview"}).type<string[]>(),
    /**
     * The deck the created card goes to. Without one, it goes to `deck`.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    targetDeckId: f.belongsTo({optional: true, stability: "preview"}).type<DeckId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    title: f.string({stability: "preview"}),
    /**
     * Goes up with every change to the step.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    version: f.int({stability: "preview"}),
    /**
     * Only `default` steps are used when a journey is started. Changing an archived or deleted step
     * sets it back to `default`.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    visibility: f.typed({stability: "preview"}).type<CardVisibility>(),
  },
  relations: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    account: relation("account", {type: "belongsTo", fk: "accountId", stability: "preview"}),
    /**
     * The owner of the created card.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    assignee: relation("user", {
      type: "belongsTo",
      fk: "assigneeId",
      optional: true,
      stability: "preview",
    }),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    creator: relation("user", {type: "belongsTo", fk: "creatorId", stability: "preview"}),
    /**
     * The deck whose journey the step belongs to.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    deck: relation("deck", {type: "belongsTo", fk: "deckId", stability: "preview"}),
    /**
     * Steps of the same journey that have to be done before this one. The created cards get the
     * same dependencies.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    inDeps: relation("workflowItem", {type: "hasMany", fkAsArray: true, stability: "preview"}),
    /**
     * Steps of the same journey that are blocked by this one.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    outDeps: relation("workflowItem", {type: "hasMany", fkAsArray: true, stability: "preview"}),
    /**
     * The deck the created card goes to. Without one, it goes to `deck`.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    targetDeck: relation("deck", {
      type: "belongsTo",
      fk: "targetDeckId",
      optional: true,
      stability: "preview",
    }),
  },
  keys: ["itemId"],
});
