import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import {type UserId} from "./User";
import {type DeckId} from "./Deck";
import {type AccountId} from "./Account";

export type DeckSubscriptionId = Nominal<string, "deckSubscription">;
export const deckSubscriptionDesc = makeModel({
  name: "deckSubscription",
  fields: {
    id: f.id<DeckSubscriptionId>(),
    userId: f.belongsTo({}).type<UserId>(),
    deckId: f.belongsTo({}).type<DeckId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    user: relation("user", {type: "belongsTo", fk: "userId"}),
    deck: relation("deck", {type: "belongsTo", fk: "deckId"}),
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
  },
  keys: ["id"],
});
