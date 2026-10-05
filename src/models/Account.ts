import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {
  StartWeekday,
  TimeTrackingMode,
  TimelineScaleType,
  Workdays,
  WorkflowMode,
} from "./definitions";

export type AccountId = Nominal<string, "account">;
/** An organization and its settings. */
export const accountDesc = makeModel({
  name: "account",
  fields: {
    /**
     * `true` makes the web app show a hero card's cover image on its sub cards, in place of their
     * own.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    allowInheritHeroCover: f.bool({stability: "preview"}),
    /**
     * Which uploaded image attachment becomes the card's `coverFile`. `first` only sets it if the
     * card has no cover yet, `last` always uses the newest image, `none` never sets it.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    attachmentCoverMode: f
      .typed({stability: "preview"})
      .type<"none" | "first" | "last" | (string & {})>(),
    createdAt: f.date({}),
    dependenciesEnabled: f.bool({}),
    dueDateEnabled: f.bool({}),
    /**
     * The effort values the web app offers for a card. A card's `effort` may still be any other
     * number.
     */
    effortScale: f.typed({}).type<number[]>(),
    /**
     * The effort the web app counts for cards without an `effort`, e.g. in charts, hero cards and
     * run capacity.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    fallbackEffort: f.int({stability: "preview"}),
    /**
     * `true` hides the number of done cards on decks in the web app.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    hideCompletedCardCountForDecks: f.bool({stability: "preview"}),
    id: f.id<AccountId>(),
    /**
     * How many cards that aren't done each user may have in their Hand, between 7 and 28.
     * `handQueue/addCardsToHand`, `handQueue/setCardOrders` and `cards/create` with `putInQueue`
     * fail beyond it. Starting a card and hand sync can still go beyond it.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    maxHandSlotCount: f.int({stability: "preview"}),
    milestonesEnabled: f.bool({}),
    name: f.string({}),
    /** The names the web app shows for the card priorities `a`, `b` and `c`. */
    priorityLabels: f.typed({}).type<{a: string; b: string; c: string}>(),
    /** Whether the organization uses runs. */
    sprintsEnabled: f.bool({}),
    /**
     * The first day of the week in the calendar and timeline. Users can override it for themselves.
     */
    startWeekday: f.typed({}).type<StartWeekday>(),
    /**
     * In seconds. A started card without changes for `snooze` seconds becomes `snoozing`. A done
     * card without changes and open comment threads for `archive` seconds gets archived. `archive`
     * is `null` when done cards never get archived.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    statusChangeDurations: f
      .typed({stability: "preview"})
      .type<{snooze: number; archive: number | null}>(),
    /** The part before `.codecks.io` in the organization's web address. */
    subdomain: f.string({}),
    /**
     * `none` turns time tracking off. `manual` allows only manual time entries. `strict` also adds
     * a timer that users start with the play button on a card.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    timeTrackingMode: f.typed({stability: "preview"}).type<TimeTrackingMode>(),
    /**
     * Whether the timeline shows days or weeks. Users can override it for themselves.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    timelineScaleType: f.typed({stability: "preview"}).type<TimelineScaleType>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    visionBoardEnabled: f.bool({stability: "preview"}),
    /**
     * The days the team works. The web app only counts these days, e.g. for the days left until a
     * milestone.
     */
    workdays: f.typed({}).type<Workdays>(),
    /**
     * `journeys` when the organization uses journeys, `only_parent_cards` when not.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    workflowMode: f.typed({stability: "preview"}).type<WorkflowMode>(),
  },
  relations: {
    archivedProjects: relation("project", {type: "hasMany"}),
    attachments: relation("attachment", {type: "hasMany"}),
    cards: relation("card", {type: "hasMany"}),
    /** Without deleted decks. */
    decks: relation("deck", {type: "hasMany"}),
    files: relation("file", {type: "hasMany"}),
    /** The bookmarked cards of all users. */
    handCards: relation("handCard", {type: "hasMany"}),
    milestones: relation("milestone", {type: "hasMany"}),
    /** Projects that are neither archived nor deleted. */
    projects: relation("project", {type: "hasMany"}),
    /** The cards in the Card Hand of all users. */
    queueEntries: relation("queueEntry", {type: "hasMany"}),
    /** The comment threads of all cards. */
    resolvables: relation("resolvable", {type: "hasMany"}),
    /** The organization's run configs. */
    sprintConfigs: relation("sprintConfig", {type: "hasMany"}),
    /** The organization's runs. */
    sprints: relation("sprint", {type: "hasMany"}),
    /**
     * The organization's journey steps.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    workflowItems: relation("workflowItem", {type: "hasMany", stability: "preview"}),
  },
  keys: ["id"],
});
