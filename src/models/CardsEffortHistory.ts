
import { makeModel } from "./_desc";
import * as f from "./_fields";


export const cardsEffortHistoryDesc = makeModel("cardsEffortHistory")
  .fields({
    effortSum: f.bigint(),
    cardCount: f.bigint(),
    date: f.day(),
    
  })
  .hasMany({
    
  })
  .compoundKey("date", "effortSum", "cardCount");
