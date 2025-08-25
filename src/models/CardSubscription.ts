
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type UserId } from "./User";
import { type CardId } from "./Card";
import { type AccountId } from "./Account";

export type CardSubscriptionId = Nominal<string, "cardSubscription">;
export const cardSubscriptionDesc = makeModel({
  name: "cardSubscription",
  fields: {
    id: f.id<CardSubscriptionId>(),
    createdAt: f.date({}),
    userId: f.belongsTo().type<UserId>(),
    cardId: f.belongsTo().type<CardId>(),
    accountId: f.belongsTo().type<AccountId>(),
  },
  relations: {
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    card: relation("card", { type: "belongsTo", fk: "cardId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["id"]
})