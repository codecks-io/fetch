
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { cardDesc } from "./Card";
import { userDesc } from "./User";
import { accountDesc } from "./Account";

export type ActiveTimeTrackerId = Nominal<string, "activeTimeTracker">;
export const activeTimeTrackerDesc = makeModel("activeTimeTracker")
  .fields({
    id: f.id<ActiveTimeTrackerId>(),
    createdAt: f.date(),
    cardId: belongsTo("card", () => cardDesc),
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .key("id");
