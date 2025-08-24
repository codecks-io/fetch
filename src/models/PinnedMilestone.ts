
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { userDesc } from "./User";
import { accountDesc } from "./Account";
import { sprintDesc } from "./Sprint";
import { milestoneDesc } from "./Milestone";

export type PinnedMilestoneId = Nominal<string, "pinnedMilestone">;
export const pinnedMilestoneDesc = makeModel("pinnedMilestone")
  .fields({
    id: f.id<PinnedMilestoneId>(),
    autoAssignStartedCard: f.bool(),
    autoAssignNewCard: f.bool(),
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => accountDesc),
    sprintId: belongsTo("sprint", () => sprintDesc),
    milestoneId: belongsTo("milestone", () => milestoneDesc),
  })
  .hasMany({
    
  })
  .key("id");
