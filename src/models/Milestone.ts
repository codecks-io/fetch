
import { makeModel, belongsTo, hasMany } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { userDesc } from "./User";
import { fileDesc } from "./File";
import { milestoneProjectDesc } from "./MilestoneProject";
import { cardDesc } from "./Card";
import { activityDesc } from "./Activity";
import { milestoneProgressDesc } from "./MilestoneProgress";

export type MilestoneId = Nominal<string, "milestone">;
export const milestoneDesc = makeModel("milestone")
  .fields({
    id: f.id<MilestoneId>(),
    name: f.string(),
    color: f.string(),
    date: f.day(),
    startDate: f.day({ optional: true }),
    createdAt: f.date(),
    accountSeq: f.int(),
    description: f.string({ optional: true }),
    isGlobal: f.string(),
    handSyncEnabled: f.string(),
    manualOrderLabels: f.string(),
    stats: f.object<any>(),
    userCapacities: f.object<any>(),
    isDeleted: f.bool(),
    preferredOrder: f.string({ optional: true }),
    accountId: belongsTo("account", () => accountDesc),
    creatorId: belongsTo("creator", () => userDesc),
    coverFileId: belongsTo("coverFile", () => fileDesc, { optional: true }),
  })
  .hasMany({
    milestoneProjects: hasMany(() => milestoneProjectDesc),
    cards: hasMany(() => cardDesc),
    activities: hasMany(() => activityDesc),
    progress: hasMany(() => milestoneProgressDesc),
  })
  .key("id");
