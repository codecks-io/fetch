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
/**
 * A task or a document card when `isDoc` is set or a hero card if it contains sub cards.
The card's
 * color is derived from `status`, `visibility`, `isDoc` and whether it has sub cards or open block
 * or review conversations.
 */
export const cardDesc = makeModel({
  name: "card",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    /**
     * The card's number within the organization. It's stored as a plan number starting at 1. The
     * web app shows it encoded as a short code after a `$`, like `$12a`. Check [this
     * gist](https://gist.github.com/danielberndt/19857421171dbb07a3681f0ea6634049) for how to
     * translate the number into the shown string and vice versa.
     */
    accountSeq: f.int({}),
    /** The card's owner. */
    assigneeId: f.belongsTo({optional: true}).type<UserId>(),
    cardId: f.id<CardId>(),
    /**
     * The checkboxes in `content`, in order.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    checkboxInfo: f.typed({stability: "preview"}).type<Checkbox[]>(),
    /** How many checkboxes `content` has, and how many of them are checked. */
    checkboxStats: f.typed({}).type<CheckboxStats>(),
    /**
     * The card's text as markdown. Its first line is the `title`. Tags, mentions, checkboxes and
     * card references in it fill `tags`, `masterTags`, `mentionedUsers`, `checkboxStats`,
     * `checkboxInfo` and `cardReferences`.
     */
    content: f.string({}),
    /** The image shown on the card's front. */
    coverFileId: f.belongsTo({optional: true}).type<FileId>(),
    createdAt: f.date({}),
    /** `null` for cards an import created. */
    creatorId: f.belongsTo({optional: true}).type<UserId>(),
    /** `null` for a private card, which only its creator sees. */
    deckId: f.belongsTo({optional: true}).type<DeckId>(),
    /**
     * The state the web app shows, combining `status`, `visibility`, `isDoc`, open review and
     * blocker threads, the assignee and whether it's a hero card: e.g. `blocked` for an open
     * blocker thread, `unassigned` for a not started card without an assignee.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    derivedStatus: f.typed({stability: "preview"}).type<DerivedStatus>(),
    dueDate: f.day({optional: true}),
    /** On the organization's scale, `account.effortScale`. */
    effort: f.int({optional: true}),
    /**
     * One of `inDeps` isn't done yet.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    hasBlockingDeps: f.bool({stability: "preview"}),
    /**
     * The card isn't done yet, and one of its `outDeps` isn't either.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    isBlockingDep: f.bool({stability: "preview"}),
    /**
     * `true` for a document card: it holds information instead of a task, so it's never started or
     * done.
     */
    isDoc: f.bool({optional: true}),
    /** When the card last changed. */
    lastUpdatedAt: f.date({}),
    /**
     * The card's project tags: the tags from the project's tag list, whether written as `#tag` in
     * `content` or set directly, plus the deck's auto-tag. Writing them may change `content`.
     */
    masterTags: f.typed({}).type<string[]>(),
    /**
     * The users mentioned in `content`.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    mentionedUsers: f.typed({stability: "preview"}).type<UserId[]>(),
    milestoneId: f.belongsTo({optional: true}).type<MilestoneId>(),
    /** The hero card this card is a sub card of. */
    parentCardId: f.belongsTo({optional: true}).type<CardId>(),
    /**
     * `a`, `b` or `c`: High, Medium and Low, unless the organization renamed them
     * (`account.priorityLabels`).
     */
    priority: f.typed({optional: true}).type<Priority>(),
    /**
     * The journey step the card was created from.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    sourceWorkflowItemId: f
      .belongsTo({optional: true, stability: "preview"})
      .type<WorkflowItemId>(),
    /** The run the card is planned into. */
    sprintId: f.belongsTo({optional: true}).type<SprintId>(),
    /**
     * `snoozing` will only be set on `started` card that nobody changed for the organization's
     * snooze time (`account.statusChangeDurations`); it can't be written. `derivedStatus` is the
     * state the web app shows.
     */
    status: f.typed({}).type<"not_started" | "started" | "snoozing" | "done" | (string & {})>(),
    /** Every tag on the card: the `#tags` in `content` and the `masterTags`, each once. */
    tags: f.typed({}).type<string[]>(),
    /**
     * The first line of `content` as plain text, without markdown and cut to 80 characters. Write
     * `content` to change it.
     */
    title: f.string({}),
    /** Goes up with every change to the card. */
    version: f.int({}),
    /** `archived` cards are put away, `deleted` ones are in the trash. Both stay readable. */
    visibility: f.typed({}).type<CardVisibility>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    /** The card's owner. */
    assignee: relation("user", {type: "belongsTo", fk: "assigneeId", optional: true}),
    /** In the order the card shows them. */
    attachments: relation("attachment", {type: "hasMany", fkAsArray: true}),
    /**
     * The cards that `content` links to.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    cardReferences: relation("card", {type: "hasMany", fkAsArray: true, stability: "preview"}),
    /** A hero card's sub cards, in order. */
    childCards: relation("card", {type: "hasMany", fkAsArray: true}),
    /** The image shown on the card's front. */
    coverFile: relation("file", {type: "belongsTo", fk: "coverFileId", optional: true}),
    /** `null` for cards an import created. */
    creator: relation("user", {type: "belongsTo", fk: "creatorId", optional: true}),
    /** `null` for a private card, which only its creator sees. */
    deck: relation("deck", {type: "belongsTo", fk: "deckId", optional: true}),
    /**
     * The card's change history.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    diffs: relation("cardHistory", {type: "hasMany", stability: "preview"}),
    /** One entry per user who bookmarked the card. */
    handCards: relation("handCard", {type: "hasMany"}),
    /**
     * The cards that have to be done before this one.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    inDeps: relation("card", {type: "hasMany", fkAsArray: true, stability: "preview"}),
    milestone: relation("milestone", {type: "belongsTo", fk: "milestoneId", optional: true}),
    /**
     * The cards that wait for this one. The counterpart of their `inDeps`.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    outDeps: relation("card", {type: "hasMany", fkAsArray: true, stability: "preview"}),
    /** The hero card this card is a sub card of. */
    parentCard: relation("card", {type: "belongsTo", fk: "parentCardId", optional: true}),
    /** One entry per user who has the card in their Card Hand. */
    queueEntries: relation("queueEntry", {type: "hasMany"}),
    /** Every comment on the card, across its threads. */
    resolvableEntries: relation("resolvableEntry", {type: "hasMany"}),
    /** The card's comment threads, including reviews and blockers (`context`). */
    resolvables: relation("resolvable", {type: "hasMany"}),
    /**
     * The journey step the card was created from.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    sourceWorkflowItem: relation("workflowItem", {
      type: "belongsTo",
      fk: "sourceWorkflowItemId",
      optional: true,
      stability: "preview",
    }),
    /** The run the card is planned into. */
    sprint: relation("sprint", {type: "belongsTo", fk: "sprintId", optional: true}),
  },
  keys: ["cardId"],
});
