import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {AccountId} from "./Account";
import type {FileId} from "./File";
import type {MilestoneId} from "./Milestone";
import type {SprintConfigId} from "./SprintConfig";
import type {UserId} from "./User";

export type SprintId = Nominal<string, "sprint">;
export const sprintDesc = makeModel({
  name: "sprint",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    accountSeq: f.int({}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    autoMilestoneId: f.belongsTo({optional: true, stability: "preview"}).type<MilestoneId>(),
    completedAt: f.date({optional: true}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    coverFileId: f.belongsTo({optional: true, stability: "preview"}).type<FileId>(),
    createdAt: f.date({}),
    creatorId: f.belongsTo({}).type<UserId>(),
    description: f.string({optional: true}),
    endDate: f.day({}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    handSyncEnabled: f.bool({stability: "preview"}),
    id: f.id<SprintId>(),
    index: f.int({}),
    isDeleted: f.bool({}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    lockedAt: f.date({optional: true, stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    manualOrderLabels: f.typed({stability: "preview"}).type<(string | null)[]>(),
    name: f.string({optional: true}),
    sprintConfigId: f.belongsTo({}).type<SprintConfigId>(),
    startDate: f.day({}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    userCapacities: f.typed({stability: "preview"}).type<{[userId: UserId]: number}>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
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
    creator: relation("user", {type: "belongsTo", fk: "creatorId"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    progress: relation("sprintProgress", {type: "hasMany", stability: "preview"}),
    sprintConfig: relation("sprintConfig", {type: "belongsTo", fk: "sprintConfigId"}),
  },
  keys: ["id"],
});
