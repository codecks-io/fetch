
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { userDesc } from "./User";
import { deckDesc } from "./Deck";
import { accountDesc } from "./Account";

export type DeckSubscriptionId = Nominal<string, "deckSubscription">;
export const deckSubscriptionDesc = makeModel("deckSubscription")
  .fields({
    id: f.id<DeckSubscriptionId>(),
    userId: belongsTo("user", () => userDesc),
    deckId: belongsTo("deck", () => deckDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .key("id");
