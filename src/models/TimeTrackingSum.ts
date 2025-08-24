
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { cardDesc } from "./Card";
import { userDesc } from "./User";


export const timeTrackingSumDesc = makeModel("timeTrackingSum")
  .fields({
    sumMs: f.int(),
    runningStartedAt: f.date(),
    runningModifyDurationMsBy: f.int(),
    cardId: belongsTo("card", () => cardDesc),
    userId: belongsTo("user", () => userDesc),
  })
  .hasMany({
    
  })
  .compoundKey("cardId", "userId");
