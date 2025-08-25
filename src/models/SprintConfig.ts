
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type AccountId } from "./Account";
import { type UserId } from "./User";

export type SprintConfigId = Nominal<string, "sprintConfig">;
export const sprintConfigDesc = makeModel({
  name: "sprintConfig",
  fields: {
    id: f.id<SprintConfigId>(),
    name: f.string({}),
    color: f.string({}),
    stopOn: f.day({ optional: true }),
    isGlobal: f.string({}),
    upcomingSprints: f.int({}),
    sprintDurationWeeks: f.int({}),
    sprintStartWeekday: f.int({}),
    endHour: f.int({}),
    endHourTimezone: f.string({}),
    createdAt: f.date({}),
    preferredOrder: f.string({ optional: true }),
    moveOnFinish: f.string({}),
    autoBeastModeDurationHours: f.int({ optional: true }),
    autoAssignStartedCard: f.bool({}),
    autoAssignNewCard: f.bool({}),
    beastGracePeriodHours: f.int({}),
    accountId: f.belongsTo().type<AccountId>(),
    creatorId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    creator: relation("user", { type: "belongsTo", fk: "creatorId" }),
    sprintProjects: relation("sprintProject", { type: "hasMany" }),
    sprints: relation("sprint", { type: "hasMany" }),
    progress: relation("sprintConfigProgress", { type: "hasMany" }),
  },
  keys: ["id"]
})