
import { makeModel } from "./_desc";
import * as f from "./_fields";


export const cardsEffortHistoryDesc = makeModel({
  name: "cardsEffortHistory",
  fields: {
    effortSum: f.bigint({}),
    cardCount: f.bigint({}),
    date: f.day({}),
    
  },
  relations: {
    
  },
  keys: ["date", "effortSum", "cardCount"]
})