
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { userDesc } from "./User";
import { cardDesc } from "./Card";
import { accountDesc } from "./Account";

export type CardSubscriptionId = Nominal<string, "cardSubscription">;
export const cardSubscriptionDesc = makeModel("cardSubscription")
  .fields({
    id: f.id<CardSubscriptionId>(),
    createdAt: f.date(),
    userId: belongsTo("user", () => userDesc),
    cardId: belongsTo("card", () => cardDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .key("id");
