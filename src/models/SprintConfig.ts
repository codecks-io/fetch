import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {MilestoneColor} from "./definitions";
import type {AccountId} from "./Account";
import type {UserId} from "./User";

export type SprintConfigId = Nominal<string, "sprintConfig">;
/**
 * A Run Config. It creates runs of the same length one after the other, like sprints, for its
 * projects.
 */
export const sprintConfigDesc = makeModel({
  name: "sprintConfig",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    /**
     * The web app puts new cards in its projects into the current run. Journeys do the same,
     * `cards/create` doesn't.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    autoAssignNewCard: f.bool({stability: "preview"}),
    /**
     * A card in one of its projects that is started without a run is added to the current run.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    autoAssignStartedCard: f.bool({stability: "preview"}),
    /**
     * Beast Mode starts on its own this many hours after the start of a run, counted from midnight
     * in the Run Config's time zone. `0` starts it right away, `null` turns it off.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    autoBeastModeDurationHours: f.int({optional: true, stability: "preview"}),
    /**
     * In Beast Mode, a card added to the run is only locked in after this many hours. Until then it
     * can move to another run without raising its Beast level.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    beastGracePeriodHours: f.int({stability: "preview"}),
    color: f.typed({}).type<MilestoneColor>(),
    createdAt: f.date({}),
    creatorId: f.belongsTo({}).type<UserId>(),
    id: f.id<SprintConfigId>(),
    /**
     * The Run Config belongs to all projects of the organization, also to projects created later.
     */
    isGlobal: f.bool({}),
    /**
     * Which cards move to the next run when a run ends: `review` for cards with an open review,
     * `blocked` for cards with an open blocker and `undone` for all other cards that aren't done.
     * Archived cards and docs stay.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    moveOnFinish: f
      .typed({stability: "preview"})
      .type<("undone" | "review" | "blocked" | (string & {}))[]>(),
    name: f.string({}),
    /**
     * The label for runs without a `name`. `%RUN_NR%` becomes the run's `index + 1` and
     * `%CALENDAR_WEEK%` the ISO week of its `startDate`. `null` means `Run %RUN_NR%`.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    runLabelTemplate: f.string({optional: true, stability: "preview"}),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    creator: relation("user", {type: "belongsTo", fk: "creatorId"}),
    /**
     * The daily history of the done cards across all runs.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    progress: relation("sprintConfigProgress", {type: "hasMany", stability: "preview"}),
    sprintProjects: relation("sprintProject", {type: "hasMany"}),
    sprints: relation("sprint", {type: "hasMany"}),
  },
  keys: ["id"],
});
