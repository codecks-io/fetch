
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { userDesc } from "./User";
import { accountDesc } from "./Account";
import { cardDesc } from "./Card";
import { timeTrackingSegmentDesc } from "./TimeTrackingSegment";


export const autoFinishedTimeTrackingSegmentDesc = makeModel("autoFinishedTimeTrackingSegment")
  .fields({
    createdAt: f.date(),
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => accountDesc),
    cardId: belongsTo("card", () => cardDesc),
    timeTrackingSegmentId: belongsTo("timeTrackingSegment", () => timeTrackingSegmentDesc),
  })
  .hasMany({
    
  })
  .compoundKey("userId", "accountId");
