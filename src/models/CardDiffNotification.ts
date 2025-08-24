
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { userDesc } from "./User";
import { cardDesc } from "./Card";
import { accountDesc } from "./Account";


export const cardDiffNotificationDesc = makeModel("cardDiffNotification")
  .fields({
    changes: f.object<any>(),
    asOwner: f.bool(),
    changers: f.array<any>(),
    lastUpdatedAt: f.date(),
    createdAt: f.date(),
    userId: belongsTo("user", () => userDesc),
    cardId: belongsTo("card", () => cardDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .compoundKey("userId", "cardId");
