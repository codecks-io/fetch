
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { userDesc } from "./User";
import { accountDesc } from "./Account";
import { cardDesc } from "./Card";


export const dueCardDesc = makeModel("dueCard")
  .fields({
    createdAt: f.date(),
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => accountDesc),
    cardId: belongsTo("card", () => cardDesc),
  })
  .hasMany({
    
  })
  .compoundKey("userId", "cardId");
