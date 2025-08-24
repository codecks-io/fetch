
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { cardDesc } from "./Card";
import { userDesc } from "./User";
import { accountDesc } from "./Account";

export type TimeTrackingSegmentId = Nominal<string, "timeTrackingSegment">;
export const timeTrackingSegmentDesc = makeModel("timeTrackingSegment")
  .fields({
    id: f.id<TimeTrackingSegmentId>(),
    createdAt: f.date(),
    finishedAt: f.date({ optional: true }),
    startedAt: f.date(),
    modifyDurationMsBy: f.int(),
    addedManually: f.string(),
    autoFinishedState: f.string(),
    cardId: belongsTo("card", () => cardDesc),
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .key("id");
