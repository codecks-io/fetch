
import { makeModel, belongsTo, hasMany } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { userDesc } from "./User";
import { sprintProjectDesc } from "./SprintProject";
import { sprintDesc } from "./Sprint";
import { sprintConfigProgressDesc } from "./SprintConfigProgress";

export type SprintConfigId = Nominal<string, "sprintConfig">;
export const sprintConfigDesc = makeModel("sprintConfig")
  .fields({
    id: f.id<SprintConfigId>(),
    name: f.string(),
    color: f.string(),
    stopOn: f.day({ optional: true }),
    isGlobal: f.string(),
    upcomingSprints: f.int(),
    sprintDurationWeeks: f.int(),
    sprintStartWeekday: f.int(),
    endHour: f.int(),
    endHourTimezone: f.string(),
    createdAt: f.date(),
    preferredOrder: f.string({ optional: true }),
    moveOnFinish: f.string(),
    autoBeastModeDurationHours: f.int({ optional: true }),
    autoAssignStartedCard: f.bool(),
    autoAssignNewCard: f.bool(),
    beastGracePeriodHours: f.int(),
    accountId: belongsTo("account", () => accountDesc),
    creatorId: belongsTo("creator", () => userDesc),
  })
  .hasMany({
    sprintProjects: hasMany(() => sprintProjectDesc),
    sprints: hasMany(() => sprintDesc),
    progress: hasMany(() => sprintConfigProgressDesc),
  })
  .key("id");
