
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { accountDesc } from "./Account";
import { cardDesc } from "./Card";
import { userDesc } from "./User";


export const cardHistoryDesc = makeModel("cardHistory")
  .fields({
    diff: f.object<any>(),
    versionCreatedAt: f.date(),
    version: f.int(),
    accountId: belongsTo("account", () => accountDesc),
    cardId: belongsTo("card", () => cardDesc),
    changerId: belongsTo("changer", () => userDesc),
  })
  .hasMany({
    
  })
  .compoundKey("cardId", "version");
