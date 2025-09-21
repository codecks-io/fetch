import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import {type AccountId} from "./Account";
import {type SprintConfigId} from "./SprintConfig";
import {type UserId} from "./User";
import {type FileId} from "./File";
import {type MilestoneId} from "./Milestone";

export type SprintId = Nominal<string, "sprint">;
export const sprintDesc = makeModel({
  name: "sprint",
  fields: {
    id: f.id<SprintId>(),
    description: f.string({}),
    name: f.string({optional: true}),
    accountSeq: f.int({}),
    index: f.int({}),
    startDate: f.day({}),
    endDate: f.day({}),
    stats: f.object({}),
    manualOrderLabels: f.string({}),
    userCapacities: f.object({}),
    handSyncEnabled: f.string({}),
    createdAt: f.date({}),
    isDeleted: f.bool({}),
    completedAt: f.date({optional: true}),
    lockedAt: f.date({optional: true}),
    accountId: f.belongsTo({}).type<AccountId>(),
    sprintConfigId: f.belongsTo({}).type<SprintConfigId>(),
    creatorId: f.belongsTo({}).type<UserId>(),
    coverFileId: f.belongsTo({optional: true}).type<FileId>(),
    autoMilestoneId: f.belongsTo({optional: true}).type<MilestoneId>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    sprintConfig: relation("sprintConfig", {type: "belongsTo", fk: "sprintConfigId"}),
    creator: relation("user", {type: "belongsTo", fk: "creatorId"}),
    coverFile: relation("file", {type: "belongsTo", fk: "coverFileId"}),
    autoMilestone: relation("milestone", {type: "belongsTo", fk: "autoMilestoneId"}),
    cards: relation("card", {type: "hasMany"}),
    progress: relation("sprintProgress", {type: "hasMany"}),
    activities: relation("activity", {type: "hasMany"}),
  },
  keys: ["id"],
});
