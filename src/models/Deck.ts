import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {DefaultCard} from "./definitions";
import type {AccountId} from "./Account";
import type {FileId} from "./File";
import type {MilestoneId} from "./Milestone";
import type {ProjectId} from "./Project";
import type {ProjectTagId} from "./ProjectTag";
import type {UserId} from "./User";

export type DeckId = Nominal<string, "deck">;
/** A list of cards within a project. `deckType` says which kind of cards it is meant for. */
export const deckDesc = makeModel({
  name: "deck",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    /**
     * The deck's number within the organization. The web app uses it in the deck's URL, like
     * `/decks/12-my-deck`.
     */
    accountSeq: f.int({}),
    /**
     * A hex color like `#ff8800`.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    coverColor: f.string({optional: true, stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    coverFileId: f.belongsTo({optional: true, stability: "preview"}).type<FileId>(),
    createdAt: f.date({}),
    creatorId: f.belongsTo({}).type<UserId>(),
    /**
     * The web app calls these Task (`task`), Asset (`hero`), Knowledge (`doc`) and Mixed (`mixed`)
     * decks. Cards in a `hero` deck count as hero cards unless they are docs or sub cards. A
     * started card that moves into a `hero` or `doc` deck goes back to `not_started`.
     */
    deckType: f.typed({}).type<"task" | "hero" | "doc" | "mixed" | (string & {})>(),
    /**
     * The deck's Template Card. The web app fills in these values when you create a card in this
     * deck. `cards/create` doesn't use them.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    defaultCard: f.typed({stability: "preview"}).type<DefaultCard>(),
    /**
     * The deck's auto tag. Cards that are created in or moved into the deck get this project tag.
     */
    defaultProjectTagId: f.belongsTo({optional: true}).type<ProjectTagId>(),
    description: f.string({}),
    /**
     * Cards in this deck that have an assignee go into the assignee's Hand. This happens when a
     * card is created, moved into the deck or gets a new assignee.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    handSyncEnabled: f.bool({stability: "preview"}),
    /**
     * The deck has [guardians](https://manual.codecks.io/guardians/). Then only guardians,
     * producers and admins may mark its cards as done or not done, archive, delete, restore or move
     * them.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    hasGuardians: f.bool({stability: "preview"}),
    id: f.id<DeckId>(),
    isDeleted: f.bool({}),
    /**
     * The names of the zones in the deck's manual order, in order. `null` is a zone without a name.
     * A card's zone is the `label` of its `cardOrder` in the `deck` context.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    manualOrderLabels: f.typed({stability: "preview"}).type<(string | null)[]>(),
    /** Setting it also puts the deck's cards into this milestone. */
    milestoneId: f.belongsTo({optional: true}).type<MilestoneId>(),
    projectId: f.belongsTo({}).type<ProjectId>(),
    /**
     * Decks within a space are sorted by it. Change it with `decks/addToSpaceAfter` or
     * `decks/addToSpaceBefore`.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    sortValue: f.string({stability: "preview"}),
    /**
     * The space of the project the deck is in, one of the ids in `project.spaces`.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    spaceId: f.int({optional: true, stability: "preview"}),
    title: f.string({}),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    cards: relation("card", {type: "hasMany"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    coverFile: relation("file", {
      type: "belongsTo",
      fk: "coverFileId",
      optional: true,
      stability: "preview",
    }),
    creator: relation("user", {type: "belongsTo", fk: "creatorId"}),
    /**
     * The deck's auto tag. Cards that are created in or moved into the deck get this project tag.
     */
    defaultProjectTag: relation("projectTag", {
      type: "belongsTo",
      fk: "defaultProjectTagId",
      optional: true,
    }),
    /** Setting it also puts the deck's cards into this milestone. */
    milestone: relation("milestone", {type: "belongsTo", fk: "milestoneId", optional: true}),
    project: relation("project", {type: "belongsTo", fk: "projectId"}),
    /**
     * The steps of the deck's journey.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    workflowItems: relation("workflowItem", {type: "hasMany", stability: "preview"}),
  },
  keys: ["id"],
});
