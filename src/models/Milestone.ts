import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {MilestoneColor} from "./definitions";
import type {AccountId} from "./Account";
import type {FileId} from "./File";
import type {UserId} from "./User";

export type MilestoneId = Nominal<string, "milestone">;
export const milestoneDesc = makeModel({
  name: "milestone",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    accountSeq: f.int({}),
    color: f.typed({}).type<MilestoneColor>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    coverFileId: f.belongsTo({optional: true, stability: "preview"}).type<FileId>(),
    createdAt: f.date({}),
    creatorId: f.belongsTo({}).type<UserId>(),
    date: f.day({}),
    description: f.string({optional: true}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    handSyncEnabled: f.bool({stability: "preview"}),
    id: f.id<MilestoneId>(),
    isDeleted: f.bool({}),
    isGlobal: f.bool({}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    manualOrderLabels: f.typed({stability: "preview"}).type<(string | null)[]>(),
    name: f.string({}),
    startDate: f.day({optional: true}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    userCapacities: f.typed({stability: "preview"}).type<{[userId: UserId]: number}>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    cards: relation("card", {type: "hasMany"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    coverFile: relation("file", {
      type: "belongsTo",
      fk: "coverFileId",
      optional: true,
      stability: "preview",
    }),
    creator: relation("user", {type: "belongsTo", fk: "creatorId"}),
    milestoneProjects: relation("milestoneProject", {type: "hasMany"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    progress: relation("milestoneProgress", {type: "hasMany", stability: "preview"}),
  },
  keys: ["id"],
});
