import type {AccountId} from "./Account";
import type {CardId} from "./Card";
import type {DeckId} from "./Deck";
import type {MilestoneId} from "./Milestone";
import type {ProjectId} from "./Project";
import type {ProjectTagId} from "./ProjectTag";
import type {QueueEntryId} from "./QueueEntry";
import type {ResolvableId} from "./Resolvable";
import type {ResolvableEntryId} from "./ResolvableEntry";
import type {ResolvableEntryReactionId} from "./ResolvableEntryReaction";
import type {SprintId} from "./Sprint";
import type {SprintConfigId} from "./SprintConfig";
import type {UserId} from "./User";

/** Every action of the API, by the name it is dispatched as: `POST /dispatch/<name>`. */
export type ActionMap = {
  /**
   * Bookmarks cards for a user, at the end of their bookmarks. Cards that are already bookmarked
   * move to the end.
   * Requires `handCard:writeOwn` or `handCard:writeAny`, depending on the call.
   */
  "bookmarks/addCards": {
    params: {
      ids: CardId[];
      userId: UserId;
    };
    response: void;
  };
  /**
   * Removes cards from a user's bookmarks.
   * Requires `handCard:writeOwn` or `handCard:writeAny`, depending on the call.
   */
  "bookmarks/removeCards": {
    params: {
      ids: CardId[];
      userId: UserId;
    };
    response: void;
  };
  /**
   * Moves cards to the top of a user's bookmarks, in the given order. The other bookmarks follow in
   * their current order. Cards that aren't bookmarked yet get bookmarked.
   * Requires `handCard:writeOwn` or `handCard:writeAny`, depending on the call.
   */
  "bookmarks/setOrders": {
    params: {
      cardIds: CardId[];
      userId: UserId;
    };
    response: void;
  };
  /**
   * Puts cards into a manual order right after `targetId`, in the order of `cardIds`, and into the
   * zone `label`.
   * Requires `cardOrder:write`.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "cardOrders/addAfter": {
    params: {
      /** `null` puts the cards at the end. */
      targetId: CardId | null;
      cardIds: CardId[];
      /**
       * Which manual order to change: the one of the cards' deck, milestone or run. A card has one
       * position in each.
       */
      context: "milestone" | "deck" | "sprint";
      /**
       * The zone, one of the `manualOrderLabels` of the deck, milestone or run. `null` is the zone
       * without a name.
       */
      label: string | null;
    };
    response: void;
  };
  /**
   * Puts cards into a manual order right before `targetId`, in the order of `cardIds`, and into the
   * zone `label`.
   * Requires `cardOrder:write`.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "cardOrders/addBefore": {
    params: {
      /** `null` puts the cards at the start. */
      targetId: CardId | null;
      cardIds: CardId[];
      /**
       * Which manual order to change: the one of the cards' deck, milestone or run. A card has one
       * position in each.
       */
      context: "milestone" | "deck" | "sprint";
      /**
       * The zone, one of the `manualOrderLabels` of the deck, milestone or run. `null` is the zone
       * without a name.
       */
      label: string | null;
    };
    response: void;
  };
  /**
   * Moves cards into another zone of a manual order and keeps their position. Cards that have no
   * position in that order yet are skipped.
   * Requires `cardOrder:write`.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "cardOrders/updateLabel": {
    params: {
      cardIds: CardId[];
      /**
       * Which manual order to change: the one of the cards' deck, milestone or run. A card has one
       * position in each.
       */
      context: "milestone" | "deck" | "sprint";
      /**
       * The zone, one of the `manualOrderLabels` of the deck, milestone or run. `null` is the zone
       * without a name.
       */
      label: string | null;
    };
    response: void;
  };
  /**
   * Sets the same values on every card in `ids`. Look at `cards/update` for the property details.
   * Requires `card:write`.
   */
  "cards/bulkUpdate": {
    params: {
      ids: CardId[];
      priority?: "a" | "b" | "c" | null;
      effort?: number | null;
      status?: "not_started" | "started" | "done";
      assigneeId?: UserId | null;
      deckId?: DeckId;
      visibility?: "default" | "archived" | "deleted";
      milestoneId?: MilestoneId | null;
      sprintId?: SprintId | null;
      /**
       * `YYYY-MM-DD`, or `null` to remove it. Fails unless the organization's plan includes due
       * dates.
       */
      dueDate?: string | null;
      isDoc?: boolean;
      /** Adds this tag to every card's `masterTags`. */
      addMasterTag?: string;
      /** Removes this tag from every card, ignoring case. */
      removeMasterTag?: string;
      parentCardId?: CardId | null;
    };
    response: void;
  };
  /**
   * Copies each card into a deck, as `not_started` and with the same `content`. A copied sub card
   * is added to its hero card right after the original.
   * Requires `card:write`.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "cards/copy": {
    params: {
      ids: CardId[];
      /** The fields to copy besides `content`. */
      props: (
        | "effort"
        | "priority"
        | "assigneeId"
        | "masterTags"
        | "attachments"
        | "milestoneId"
        | "sprintId"
      )[];
      /** The id of the deck to copy into. */
      target: string;
    };
    response: void;
  };
  /**
   * Creates a card as `not_started`. The first line of `content` becomes its `title`. Everyone
   * mentioned in `content` is subscribed to the card.
   * Requires `card:write`.
   */
  "cards/create": {
    params: {
      /** Markdown. Its first line becomes the card's `title`. */
      content: string;
      priority?: "a" | "b" | "c" | null;
      effort?: number | null;
      assigneeId?: UserId | null;
      /** `null` creates a private card, and bookmarks it for you. */
      deckId: DeckId | null;
      /** Project tags, on top of those written as `#tag` in `content`. */
      masterTags?: string[];
      milestoneId?: MilestoneId | null;
      sprintId?: SprintId | null;
      /** Adds the card as the last sub card of this hero card. */
      parentCardId?: CardId | null;
      /** `YYYY-MM-DD`. Fails unless the organization's plan includes due dates. */
      dueDate?: string | null;
      isDoc?: boolean;
      /** Bookmarks the card for you. */
      addAsBookmark?: boolean;
      /**
       * Adds the card to its assignee's Hand, or to yours when it has none. Fails when that Hand
       * has no free slot (`account.maxHandSlotCount`).
       */
      putInQueue?: boolean;
      /** Subscribes you to the card, so you're notified about its changes and comments. */
      subscribeCreator?: boolean;
    };
    response: {
      id: CardId;
      /** The card's number, see `card.accountSeq`. */
      accountSeq: number;
    };
  };
  /**
   * Creates cards in one deck and returns their ids in the same order. Unlike `cards/create`, it
   * doesn't subscribe you to them.
   * Requires `card:write`.
   */
  "cards/createMany": {
    params: {
      /**
       * The first line of each `content` becomes the card's `title`. `status` defaults to
       * `not_started`, `visibility` to `default`.
       */
      cards: {
        content: string;
        priority?: "a" | "b" | "c" | null;
        effort?: number | null;
        assigneeId?: UserId | null;
        isDoc?: boolean;
        visibility?: "archived" | "default" | "deleted";
        status?: "not_started" | "started" | "done" | null;
      }[];
      deckId: DeckId;
      /** Adds the cards as the last sub cards of this hero card. */
      parentCardId?: CardId | null;
    };
    response: {
      cards: {id: CardId; accountSeq: number}[];
    };
  };
  /**
   * Changes the given fields of a card. Some writes change other fields too: `content` sets `title`
   * and `tags`, and giving a started card another assignee sets it back to `not_started`.
   * Requires `card:write`.
   */
  "cards/update": {
    params: {
      id: CardId;
      /** Markdown. Its first line becomes the card's `title`. */
      content?: string;
      priority?: "a" | "b" | "c" | null;
      effort?: number | null;
      /** A Hero Card can't be started. */
      status?: "not_started" | "started" | "done";
      assigneeId?: UserId | null;
      deckId?: DeckId;
      /** Replaces the project tags. Those written as `#tag` in `content` stay. */
      masterTags?: string[];
      /**
       * Archiving or deleting a started card sets it back to `not_started`. Deleting also removes
       * its dependencies.
       */
      visibility?: "default" | "archived" | "deleted";
      milestoneId?: MilestoneId | null;
      sprintId?: SprintId | null;
      /** The hero card to make this card a sub card of. */
      parentCardId?: CardId | null;
      /**
       * A hero card's sub cards, in order.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      childCards?: CardId[] | null;
      /**
       * The cards that have to be done before this one. Fails when it would make a cycle.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      inDeps?: CardId[];
      /**
       * The cards that are blocked by this one.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      outDeps?: CardId[];
      /**
       * `YYYY-MM-DD`, or `null` to remove it. Fails unless the organization's plan includes due
       * dates.
       */
      dueDate?: string | null;
      isDoc?: boolean;
    };
    response: void;
  };
  /**
   * Updates several cards, each with its own values. Cards that don't exist or that you can't see
   * are skipped.
   * Requires `card:write`.
   */
  "cards/updateMany": {
    params: {
      /**
       * Each needs a `content` or a `title`. With both, the content becomes the title, an empty
       * line and `content`. A `title` alone replaces the first line of the current content. Project
       * tags in `masterTags` that the project doesn't have yet are created.
       */
      cards: {
        id: CardId;
        content?: string | null;
        title?: string | null;
        priority?: "a" | "b" | "c" | null;
        effort?: number | null;
        assigneeId?: UserId | null;
        isDoc?: boolean;
        visibility?: "archived" | "default" | "deleted";
        status?: "not_started" | "started" | "done" | null;
        masterTags?: string[];
      }[];
    };
    response: void;
  };
  /**
   * Moves decks into a project's space, right after `targetId` and in the order of `deckIds`. Decks
   * from another project move with their cards.
   * Requires `deck:write`.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "decks/addToSpaceAfter": {
    params: {
      deckIds: DeckId[];
      /** `null` puts the decks at the end of the space. */
      targetId: DeckId | null;
      targetProjectId: ProjectId;
      /** One of the ids in `project.spaces`. */
      targetSpaceId: number;
    };
    response: void;
  };
  /**
   * Moves decks into a project's space, right before `targetId` and in the order of `deckIds`.
   * Decks from another project move with their cards.
   * Requires `deck:write`.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "decks/addToSpaceBefore": {
    params: {
      deckIds: DeckId[];
      /** `null` puts the decks at the start of the space. */
      targetId: DeckId | null;
      targetProjectId: ProjectId;
      /** One of the ids in `project.spaces`. */
      targetSpaceId: number;
    };
    response: void;
  };
  /**
   * Creates a deck at the end of the project's first space. `deckType` defaults to that space's
   * `defaultDeckType`.
   * Requires `deck:write`.
   */
  "decks/create": {
    params: {
      title: string;
      projectId: ProjectId;
      /**
       * A hex color like `#ff8800`.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      coverColor?: string | null;
      deckType?: "task" | "hero" | "doc" | "mixed";
    };
    response: {
      id: DeckId;
    };
  };
  /**
   * Sets `isDeleted` on the deck and archives its cards, their sub cards in other decks, and the
   * journey steps that create cards in this deck.
   * Requires `deck:delete`.
   */
  "decks/delete": {
    params: {
      id: DeckId;
    };
    response: void;
  };
  /**
   * Renames a zone of the deck's manual order. The cards in that zone move to the new name with it,
   * including archived ones.
   * Requires `deck:write` and `cardOrder:write`.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "decks/renameZone": {
    params: {
      id: DeckId;
      /** The zone to rename, one of `manualOrderLabels`. `null` is the zone without a name. */
      label: string | null;
      /** Trimmed. Fails if the deck already has a zone with that name. */
      newLabel: string;
    };
    response: void;
  };
  /** Requires `deck:write` or `project:write`, depending on the call. */
  "decks/update": {
    params: {
      id: DeckId;
      /**
       * Also puts the deck's cards that aren't archived or deleted into this milestone. `null` only
       * takes it from cards that were in the deck's old milestone.
       */
      milestoneId?: MilestoneId | null;
      title?: string;
      description?: string;
      /**
       * Turning it on adds the deck's assigned cards that aren't done to their assignee's Hand.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      handSyncEnabled?: boolean;
      /**
       * The deck's auto tag. Changing it removes the old tag from all of the deck's cards and adds
       * the new one.
       */
      defaultProjectTagId?: ProjectTagId | null;
      /**
       * The zone names are trimmed, and duplicates are dropped. Renaming a zone here leaves its
       * cards with the old name; use `decks/renameZone` instead.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      manualOrderLabels?: (string | null)[];
      /**
       * A hex color like `#ff8800`.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      coverColor?: string | null;
      /**
       * Switching to `hero` sets the deck's started cards back to `not_started`. Switching to
       * `hero` or `doc` fails while journey steps create their cards in this deck.
       */
      deckType?: "task" | "hero" | "doc" | "mixed";
    };
    response: void;
  };
  /**
   * Sets the deck's guardians to exactly `userIds` and updates `hasGuardians`. Fails unless the
   * organization's plan includes guardians or `userIds` is empty.
   * Requires `deckGuardian:write`.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "decks/updateGuardians": {
    params: {
      id: DeckId;
      userIds: UserId[];
    };
    response: void;
  };
  /**
   * Adds cards to the end of a user's Hand. Cards that are done, deleted, archived or already in
   * that Hand are skipped. A card without an owner gets the user as owner. Fails when the Hand
   * doesn't have enough free slots (`account.maxHandSlotCount`).
   * Requires `queueEntry:write`.
   */
  "handQueue/addCardsToHand": {
    params: {
      cardIds: CardId[];
      userId: UserId;
    };
    response: {
      /** The new entries, one for each added card. */
      queueEntries: {id: QueueEntryId; cardId: CardId}[];
    };
  };
  /**
   * Removes cards from a user's Hand, or from every Hand when `userId` is left out. This includes
   * entries in the done pile.
   * Requires `queueEntry:write`.
   */
  "handQueue/removeCards": {
    params: {
      cardIds: CardId[];
      userId?: UserId;
    };
    response: void;
  };
  /**
   * Sets the order of a user's Hand and can add cards to it. A card added this way that has no
   * owner gets the user as owner. Fails when the Hand doesn't have enough free slots for the added
   * cards (`account.maxHandSlotCount`).
   * Requires `queueEntry:write`.
   */
  "handQueue/setCardOrders": {
    params: {
      /**
       * The new order from the first card on. Cards of the Hand that are missing here follow in
       * their current order. Cards that are neither in the Hand nor in `draggedCardIds` are
       * ignored.
       */
      cardIds: CardId[];
      /**
       * The cards that moved, from within the Hand or from outside. Cards from outside are added.
       * Nothing changes if it is empty or none of them can be in a Hand, e.g. because they are
       * deleted.
       */
      draggedCardIds: CardId[];
      userId: UserId;
    };
    response: {
      /** The Hand's entries after the change. */
      queueEntries: {id: QueueEntryId; cardId: CardId}[];
    };
  };
  /**
   * Creates a milestone for the projects in `projectIds`, or for all projects with `isGlobal`.
   * Requires `milestone:write`.
   */
  "milestones/create": {
    params: {
      accountId: AccountId;
      name: string;
      description?: string;
      color: "gray" | "brown" | "yellow" | "red" | "pink" | "blue" | "green";
      /** `YYYY-MM-DD`. */
      date: string;
      /** `YYYY-MM-DD`. */
      startDate?: string | null;
      isGlobal: boolean;
      /** Ignored when `isGlobal` is set. */
      projectIds: ProjectId[] | null;
    };
    response: {
      id: MilestoneId;
      /** The milestone's number, see `milestone.accountSeq`. */
      accountSeq: number;
    };
  };
  /**
   * Marks a milestone as deleted (`isDeleted`). It's removed from all its cards and decks, and
   * nobody has it pinned anymore.
   * Requires `milestone:write`.
   */
  "milestones/delete": {
    params: {
      id: MilestoneId;
    };
    response: void;
  };
  /**
   * Pins a milestone for a user. The web app shows it in the user's Hand. A user has one pinned
   * milestone per organization, so pinning another one replaces it.
   * Requires `pinnedMilestone:writeOwn` or `pinnedMilestone:writeAny`, depending on the call.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "milestones/pin": {
    params: {
      /** `null` removes the user's pin. */
      milestoneId: MilestoneId | null;
      /** The token's own user. For a personal token, that's you. */
      userId: UserId;
    };
    response: void;
  };
  /**
   * Renames a zone of the milestone's manual order. The cards in that zone move to the new name
   * with it, including archived ones.
   * Requires `milestone:write` and `cardOrder:write`.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "milestones/renameZone": {
    params: {
      id: MilestoneId;
      /** The zone to rename, one of `manualOrderLabels`. `null` is the zone without a name. */
      label: string | null;
      /** Trimmed. Fails if the milestone already has a zone with that name. */
      newLabel: string;
    };
    response: void;
  };
  /** Requires `milestone:write`. */
  "milestones/update": {
    params: {
      id: MilestoneId;
      name?: string;
      description?: string;
      color?: "gray" | "brown" | "yellow" | "red" | "pink" | "blue" | "green";
      /** `YYYY-MM-DD`. */
      date?: string;
      /** `YYYY-MM-DD`, or `null` to remove it. */
      startDate?: string | null;
      /**
       * Turning it on also adds the milestone's cards that are not done and have an assignee to the
       * assignee's Hand.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      handSyncEnabled?: boolean;
      /**
       * `true` links the milestone to all projects. `false` needs `projectIds` if the milestone is
       * global.
       */
      isGlobal?: boolean;
      /**
       * Replaces the milestone's projects and makes it non-global. Ignored with `isGlobal: true`.
       * Cards and decks of projects that are removed lose the milestone.
       */
      projectIds?: ProjectId[] | null;
      /**
       * Labels are trimmed, and duplicates are removed. Renaming a zone here leaves its cards with
       * the old name; use `milestones/renameZone` instead.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      manualOrderLabels?: (string | null)[];
      /**
       * Replaces all capacities. Fails with a value above 0 unless the organization's plan includes
       * capacity tracking.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      userCapacities?: {[key: string]: number};
    };
    response: void;
  };
  /**
   * Adds your reaction to a comment. Fails if you already reacted with the same emoji.
   * Requires `resolvableEntryReaction:writeOwn`.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "resolvables/addReaction": {
    params: {
      entryId: ResolvableEntryId;
      /** `value` is the emoji character itself, like `👍`. */
      value: {type: "emoji"; value: string};
    };
    response: {
      id: ResolvableEntryReactionId;
    };
  };
  /**
   * Closes a comment thread. Closing a `block` or `review` thread ends the card's blocked or in
   * review state. In a deck with guardians, only a guardian, a producer or an admin may close a
   * `review`, unless the guardians in it approved and you are the card's assignee.
   * Requires `resolvable:write` or `card:write`, depending on the call.
   */
  "resolvables/close": {
    params: {
      id: ResolvableId;
      /** Also sets the card's `status` to `done`. */
      markCardDone?: boolean;
    };
    response: {
      cardId: CardId;
    };
  };
  /**
   * Adds a comment to a thread. You and everyone mentioned in `content` join the thread, even if
   * you opted out before. The other participants who didn't opt out are notified.
   * Requires `resolvableEntry:writeOwn`.
   */
  "resolvables/comment": {
    params: {
      resolvableId: ResolvableId;
      /** Markdown. `@name` mentions of the organization's users are stored as `@[userId:<id>]`. */
      content: string;
    };
    response: {
      id: ResolvableEntryId;
    };
  };
  /**
   * Starts a comment thread on a card with its first comment. You, the card's assignee and everyone
   * mentioned in `content` join it, and everyone watching the card is notified.
   * Requires `resolvable:write` or `card:write`, depending on the call.
   */
  "resolvables/create": {
    params: {
      cardId: CardId;
      /**
       * `block` or `review` sets the card back to `not_started` and marks it as blocked or in
       * review until the thread is closed. A `review` thread also adds the deck's guardians.
       */
      context: "block" | "review" | "comment";
      /** Markdown. `@name` mentions of the organization's users are stored as `@[userId:<id>]`. */
      content: string;
    };
    response: {
      id: ResolvableId;
    };
  };
  /**
   * Requires `resolvableEntryReaction:writeOwn` or `resolvableEntryReaction:writeAny`, depending on
   * the call.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "resolvables/removeReaction": {
    params: {
      reactionId: ResolvableEntryReactionId;
    };
    response: void;
  };
  /**
   * Opens a closed comment thread again. Reopening a `block` or `review` thread sets the card back
   * to `not_started`, and fails for doc cards, hero cards and cards that already have an open
   * `block` or `review` thread.
   * Requires `resolvable:write` or `card:write`, depending on the call.
   */
  "resolvables/reopen": {
    params: {
      id: ResolvableId;
    };
    response: void;
  };
  /**
   * Changes a comment's `content`. If the thread is open, users newly mentioned in it join the
   * thread.
   * Requires `resolvableEntry:writeOwn` or `resolvableEntry:writeAny`, depending on the call.
   */
  "resolvables/updateComment": {
    params: {
      entryId: ResolvableEntryId;
      /** Markdown. `@name` mentions of the organization's users are stored as `@[userId:<id>]`. */
      content: string;
    };
    response: void;
  };
  /**
   * Opts a participant out of a comment thread (`done: true`) or back in (`done: false`).
   * Participants who opted out aren't notified about new comments. The card's assignee can't opt
   * out.
   * Requires `resolvableParticipant:writeOwn` or `resolvableParticipant:writeAny`, depending on the
   * call.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "resolvables/updateParticipantDone": {
    params: {
      resolvableId: ResolvableId;
      userId: UserId;
      done: boolean;
      /**
       * Defaults to `opt_out` with `done: true` and to `active` otherwise. A guardian uses
       * `approve` with `done: true` to approve a `review` thread.
       */
      status?: "active" | "opt_out" | "approve";
    };
    response: void;
  };
  /**
   * Renames a zone of the run's manual order. The cards in that zone move to the new name with it,
   * including archived ones.
   * Requires `sprint:write` and `cardOrder:write`.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "sprints/renameZone": {
    params: {
      id: SprintId;
      /** The zone to rename, one of `manualOrderLabels`. `null` is the zone without a name. */
      label: string | null;
      /** Trimmed. Fails if the run already has a zone with that name. */
      newLabel: string;
    };
    response: void;
  };
  /**
   * Changes the given fields of a Run Config. A new `autoBeastModeDurationHours` starts Beast Mode
   * for the current run right away if that time has already passed.
   * Requires `sprintConfig:write`.
   */
  "sprints/updateConfig": {
    params: {
      id: SprintConfigId;
      name?: string;
      color?: "gray" | "brown" | "yellow" | "red" | "pink" | "blue" | "green";
      /**
       * `true` links the Run Config to all projects. `false` needs `projectIds` if the Run Config
       * is global.
       */
      isGlobal?: boolean;
      /**
       * Fails with a value above 0 unless the organization's plan includes Beast Mode.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      autoBeastModeDurationHours?: number | null;
      /**
       * Fails with a value above 0 unless the organization's plan includes Beast Mode.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      beastGracePeriodHours?: number;
      /**
       * Replaces the Run Config's projects and makes it non-global. Ignored with `isGlobal: true`.
       * Cards of projects that are removed are taken out of their run.
       */
      projectIds?: ProjectId[] | null;
      /** @experimental `preview` in the Codecks API: may change in any release. */
      moveOnFinish?: ("undone" | "review" | "blocked")[];
      /** @experimental `preview` in the Codecks API: may change in any release. */
      autoAssignStartedCard?: boolean;
      /** @experimental `preview` in the Codecks API: may change in any release. */
      autoAssignNewCard?: boolean;
      /**
       * Has to contain `%RUN_NR%` or `%CALENDAR_WEEK%`.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      runLabelTemplate?: string | null;
    };
    response: void;
  };
  /**
   * Changes the given fields of a run, and can start its Beast Mode or complete it.
   * Requires `sprint:write`.
   */
  "sprints/updateSprint": {
    params: {
      id: SprintId;
      /** `null` makes the web app show the label from the Run Config's `runLabelTemplate`. */
      name?: string | null;
      description?: string;
      /** @experimental `preview` in the Codecks API: may change in any release. */
      handSyncEnabled?: boolean;
      /**
       * Labels are trimmed, and duplicates are removed. Renaming a zone here leaves its cards with
       * the old name; use `sprints/renameZone` instead.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      manualOrderLabels?: (string | null)[];
      /**
       * Replaces all capacities. Fails with a value above 0 unless the organization's plan includes
       * capacity tracking.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      userCapacities?: {[key: string]: number};
      /**
       * Also gives this milestone to the run's cards that have none.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      autoMilestoneId?: MilestoneId | null;
      /**
       * `true` starts Beast Mode for the run now and locks in all its cards. Fails if it's already
       * on, or unless the organization's plan includes Beast Mode.
       * @experimental `preview` in the Codecks API: may change in any release.
       */
      lockIn?: boolean;
      /**
       * `true` completes the run now, as if it ended. Cards move to the next run as set in the Run
       * Config's `moveOnFinish`. Fails if the run is already completed.
       */
      complete?: boolean;
    };
    response: void;
  };
  /**
   * Watches a card for you, so you're notified about its changes and new comment threads. Does
   * nothing if you already watch it.
   * Requires `cardSubscription:writeOwn`.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "watchings/addCard": {
    params: {
      cardId: CardId;
    };
    response: {
      id: string;
    };
  };
  /**
   * Makes a user watch a deck. That's the same as watching every card in it, including cards added
   * later. Does nothing if the user already watches it.
   * Requires `deckSubscription:writeOwn` or `deckSubscription:writeAny`, depending on the call.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "watchings/addDeck": {
    params: {
      deckId: DeckId;
      /** The token's own user. For a personal token, that's you. */
      userId: UserId;
    };
    response: {
      id: string;
    };
  };
  /**
   * Stops watching a card. You still get its notifications while you watch its deck.
   * Requires `cardSubscription:writeOwn`.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "watchings/removeCard": {
    params: {
      cardId: CardId;
    };
    response: void;
  };
  /**
   * Stops a user from watching a deck. Cards the user watches on their own stay watched.
   * Requires `deckSubscription:writeOwn` or `deckSubscription:writeAny`, depending on the call.
   * @experimental `preview` in the Codecks API: may change in any release.
   */
  "watchings/removeDeck": {
    params: {
      deckId: DeckId;
      userId: UserId;
    };
    response: void;
  };
};
