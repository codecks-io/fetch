
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { userDesc } from "./User";
import { accountDesc } from "./Account";
import { cardDesc } from "./Card";

export type CardUpvoteId = Nominal<string, "cardUpvote">;
export const cardUpvoteDesc = makeModel("cardUpvote")
  .fields({
    id: f.id<CardUpvoteId>(),
    type: f.string(),
    createdAt: f.date(),
    discordUserInfo: f.object<any>(),
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => accountDesc),
    cardId: belongsTo("card", () => cardDesc),
  })
  .hasMany({
    
  })
  .key("id");
