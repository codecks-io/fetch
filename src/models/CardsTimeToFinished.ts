
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { cardDesc } from "./Card";
import { userDesc } from "./User";


export const cardsTimeToFinishedDesc = makeModel("cardsTimeToFinished")
  .fields({
    effort: f.int(),
    startedAt: f.date(),
    doneAt: f.date(),
    cardId: belongsTo("card", () => cardDesc),
    assigneeId: belongsTo("assignee", () => userDesc),
  })
  .hasMany({
    
  })
  .compoundKey("cardId", "startedAt", "doneAt", "effort", "assigneeId");
