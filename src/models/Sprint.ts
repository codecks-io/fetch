import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {AccountId} from "./Account";
import type {FileId} from "./File";
import type {MilestoneId} from "./Milestone";
import type {SprintConfigId} from "./SprintConfig";
import type {UserId} from "./User";

export type SprintId = Nominal<string, "sprint">;
/**
 * A run: one time box of a Run Config, from `startDate` to `endDate`. Codecks creates the upcoming
 * runs ahead of time and completes a run when it ends.
 */
export const sprintDesc = makeModel({
  name: "sprint",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    /**
     * The run's number within the organization. The web app uses it in the run's URL:
     * `/milestones/run/<accountSeq>`.
     */
    accountSeq: f.int({}),
    /**
     * Cards that are added to this run get this milestone, unless they already have one.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    autoMilestoneId: f.belongsTo({optional: true, stability: "preview"}).type<MilestoneId>(),
    /** When the run was completed, at its end or with `complete` in `sprints/updateSprint`. */
    completedAt: f.date({optional: true}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    coverFileId: f.belongsTo({optional: true, stability: "preview"}).type<FileId>(),
    createdAt: f.date({}),
    description: f.string({optional: true}),
    /** The last day of the run. */
    endDate: f.day({}),
    /**
     * A card that is created in this run with an assignee is added to the assignee's Hand.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    handSyncEnabled: f.bool({stability: "preview"}),
    id: f.id<SprintId>(),
    /**
     * The position of the run within its Run Config, starting at 0. The web app shows `index + 1`
     * as the run's number.
     */
    index: f.int({}),
    isDeleted: f.bool({}),
    /**
     * When Beast Mode started for this run. In Beast Mode the run's cards are locked in, and moving
     * one of them to another run raises its Beast level. `null` while it is off.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    lockedAt: f.date({optional: true, stability: "preview"}),
    /**
     * The names of the zones the web app groups the cards into when they are ordered by hand, in
     * order. `null` is the zone without a name. A new run starts with the zones of the run before
     * it.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    manualOrderLabels: f.typed({stability: "preview"}).type<(string | null)[]>(),
    /**
     * `null` unless set by hand. The web app then shows a label from the Run Config's
     * `runLabelTemplate`, or `Run <index + 1>`.
     */
    name: f.string({optional: true}),
    sprintConfigId: f.belongsTo({}).type<SprintConfigId>(),
    startDate: f.day({}),
    /**
     * The planned effort per user, keyed by user id. The web app compares it with the effort of the
     * user's cards, where a card without `effort` counts as `account.fallbackEffort`. A new run
     * starts with the capacities of the run before it.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    userCapacities: f.typed({stability: "preview"}).type<{[userId: UserId]: number}>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    /**
     * Cards that are added to this run get this milestone, unless they already have one.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    autoMilestone: relation("milestone", {
      type: "belongsTo",
      fk: "autoMilestoneId",
      optional: true,
      stability: "preview",
    }),
    cards: relation("card", {type: "hasMany"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    coverFile: relation("file", {
      type: "belongsTo",
      fk: "coverFileId",
      optional: true,
      stability: "preview",
    }),
    /**
     * The daily progress history.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    progress: relation("sprintProgress", {type: "hasMany", stability: "preview"}),
    sprintConfig: relation("sprintConfig", {type: "belongsTo", fk: "sprintConfigId"}),
  },
  keys: ["id"],
});
