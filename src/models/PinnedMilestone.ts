
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type UserId } from "./User";
import { type AccountId } from "./Account";
import { type SprintId } from "./Sprint";
import { type MilestoneId } from "./Milestone";

export type PinnedMilestoneId = Nominal<string, "pinnedMilestone">;
export const pinnedMilestoneDesc = makeModel({
  name: "pinnedMilestone",
  fields: {
    id: f.id<PinnedMilestoneId>(),
    autoAssignStartedCard: f.bool({}),
    autoAssignNewCard: f.bool({}),
    userId: f.belongsTo({}).type<UserId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
    sprintId: f.belongsTo({}).type<SprintId>(),
    milestoneId: f.belongsTo({}).type<MilestoneId>(),
  },
  relations: {
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    sprint: relation("sprint", { type: "belongsTo", fk: "sprintId" }),
    milestone: relation("milestone", { type: "belongsTo", fk: "milestoneId" }),
  },
  keys: ["id"]
})