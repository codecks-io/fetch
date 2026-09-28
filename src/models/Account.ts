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
export const accountDesc = makeModel({
  name: "account",
  fields: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    allowInheritHeroCover: f.bool({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    attachmentCoverMode: f
      .typed({stability: "preview"})
      .type<"none" | "first" | "last" | (string & {})>(),
    createdAt: f.date({}),
    dependenciesEnabled: f.bool({}),
    dueDateEnabled: f.bool({}),
    effortScale: f.typed({}).type<number[]>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    fallbackEffort: f.int({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    hideCompletedCardCountForDecks: f.bool({stability: "preview"}),
    id: f.id<AccountId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    maxHandSlotCount: f.int({stability: "preview"}),
    milestonesEnabled: f.bool({}),
    name: f.string({}),
    priorityLabels: f.typed({}).type<{a: string; b: string; c: string}>(),
    sprintsEnabled: f.bool({}),
    startWeekday: f.typed({}).type<StartWeekday>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    statusChangeDurations: f
      .typed({stability: "preview"})
      .type<{snooze: number; archive: number | null}>(),
    subdomain: f.string({}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    timeTrackingMode: f.typed({stability: "preview"}).type<TimeTrackingMode>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    timelineScaleType: f.typed({stability: "preview"}).type<TimelineScaleType>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    visionBoardEnabled: f.bool({stability: "preview"}),
    workdays: f.typed({}).type<Workdays>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    workflowMode: f.typed({stability: "preview"}).type<WorkflowMode>(),
  },
  relations: {
    archivedProjects: relation("project", {type: "hasMany"}),
    attachments: relation("attachment", {type: "hasMany"}),
    cards: relation("card", {type: "hasMany"}),
    decks: relation("deck", {type: "hasMany"}),
    files: relation("file", {type: "hasMany"}),
    handCards: relation("handCard", {type: "hasMany"}),
    milestones: relation("milestone", {type: "hasMany"}),
    projects: relation("project", {type: "hasMany"}),
    queueEntries: relation("queueEntry", {type: "hasMany"}),
    resolvables: relation("resolvable", {type: "hasMany"}),
    sprintConfigs: relation("sprintConfig", {type: "hasMany"}),
    sprints: relation("sprint", {type: "hasMany"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    workflowItems: relation("workflowItem", {type: "hasMany", stability: "preview"}),
  },
  keys: ["id"],
});
