
import { makeModel, belongsTo, hasMany } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { sprintConfigDesc } from "./SprintConfig";
import { userDesc } from "./User";
import { fileDesc } from "./File";
import { milestoneDesc } from "./Milestone";
import { cardDesc } from "./Card";
import { sprintProgressDesc } from "./SprintProgress";
import { activityDesc } from "./Activity";

export type SprintId = Nominal<string, "sprint">;
export const sprintDesc = makeModel("sprint")
  .fields({
    id: f.id<SprintId>(),
    description: f.string(),
    name: f.string({ optional: true }),
    accountSeq: f.int(),
    index: f.int(),
    startDate: f.day(),
    endDate: f.day(),
    stats: f.object<any>(),
    manualOrderLabels: f.string(),
    userCapacities: f.object<any>(),
    handSyncEnabled: f.string(),
    createdAt: f.date(),
    isDeleted: f.bool(),
    completedAt: f.date({ optional: true }),
    lockedAt: f.date({ optional: true }),
    accountId: belongsTo("account", () => accountDesc),
    sprintConfigId: belongsTo("sprintConfig", () => sprintConfigDesc),
    creatorId: belongsTo("creator", () => userDesc),
    coverFileId: belongsTo("coverFile", () => fileDesc, { optional: true }),
    autoMilestoneId: belongsTo("autoMilestone", () => milestoneDesc, { optional: true }),
  })
  .hasMany({
    cards: hasMany(() => cardDesc),
    progress: hasMany(() => sprintProgressDesc),
    activities: hasMany(() => activityDesc),
  })
  .key("id");
