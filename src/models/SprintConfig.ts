import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {MilestoneColor} from "./definitions";
import type {AccountId} from "./Account";
import type {UserId} from "./User";

export type SprintConfigId = Nominal<string, "sprintConfig">;
export const sprintConfigDesc = makeModel({
  name: "sprintConfig",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    autoAssignNewCard: f.bool({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    autoAssignStartedCard: f.bool({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    autoBeastModeDurationHours: f.int({optional: true, stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    beastGracePeriodHours: f.int({stability: "preview"}),
    color: f.typed({}).type<MilestoneColor>(),
    createdAt: f.date({}),
    creatorId: f.belongsTo({}).type<UserId>(),
    id: f.id<SprintConfigId>(),
    isGlobal: f.bool({}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    moveOnFinish: f
      .typed({stability: "preview"})
      .type<("undone" | "review" | "blocked" | (string & {}))[]>(),
    name: f.string({}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    runLabelTemplate: f.string({optional: true, stability: "preview"}),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    creator: relation("user", {type: "belongsTo", fk: "creatorId"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    progress: relation("sprintConfigProgress", {type: "hasMany", stability: "preview"}),
    sprintProjects: relation("sprintProject", {type: "hasMany"}),
    sprints: relation("sprint", {type: "hasMany"}),
  },
  keys: ["id"],
});
