
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { userDesc } from "./User";


export const cardsFinishedHistoryDesc = makeModel("cardsFinishedHistory")
  .fields({
    effortSum: f.bigint(),
    cardCount: f.bigint(),
    date: f.day(),
    assigneeId: belongsTo("assignee", () => userDesc),
  })
  .hasMany({
    
  })
  .compoundKey("date", "effortSum", "cardCount", "assigneeId");
