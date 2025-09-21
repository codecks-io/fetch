import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import {type AccountId} from "./Account";
import {type UserId} from "./User";
import {type FileId} from "./File";

export type MilestoneId = Nominal<string, "milestone">;
export const milestoneDesc = makeModel({
  name: "milestone",
  fields: {
    id: f.id<MilestoneId>(),
    name: f.string({}),
    color: f.string({}),
    date: f.day({}),
    startDate: f.day({optional: true}),
    createdAt: f.date({}),
    accountSeq: f.int({}),
    description: f.string({optional: true}),
    isGlobal: f.string({}),
    handSyncEnabled: f.string({}),
    manualOrderLabels: f.string({}),
    stats: f.object({}),
    userCapacities: f.object({}),
    isDeleted: f.bool({}),
    preferredOrder: f.string({optional: true}),
    accountId: f.belongsTo({}).type<AccountId>(),
    creatorId: f.belongsTo({}).type<UserId>(),
    coverFileId: f.belongsTo({optional: true}).type<FileId>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    creator: relation("user", {type: "belongsTo", fk: "creatorId"}),
    coverFile: relation("file", {type: "belongsTo", fk: "coverFileId"}),
    milestoneProjects: relation("milestoneProject", {type: "hasMany"}),
    cards: relation("card", {type: "hasMany"}),
    activities: relation("activity", {type: "hasMany"}),
    progress: relation("milestoneProgress", {type: "hasMany"}),
  },
  keys: ["id"],
});
