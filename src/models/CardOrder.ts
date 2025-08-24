
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { cardDesc } from "./Card";
import { accountDesc } from "./Account";


export const cardOrderDesc = makeModel("cardOrder")
  .fields({
    sortValue: f.string(),
    label: f.string(),
    cardId: belongsTo("card", () => cardDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .compoundKey("context", "cardId");
