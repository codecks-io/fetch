
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { userDesc } from "./User";
import { accountDesc } from "./Account";
import { cardDesc } from "./Card";


export const handCardDesc = makeModel("handCard")
  .fields({
    sortIndex: f.int(),
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => accountDesc),
    cardId: belongsTo("card", () => cardDesc),
  })
  .hasMany({
    
  })
  .compoundKey("cardId", "userId", "accountId");
