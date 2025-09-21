import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import {type UserId} from "./User";
import {type AccountId} from "./Account";
import {type CardId} from "./Card";

export type CardUpvoteId = Nominal<string, "cardUpvote">;
export const cardUpvoteDesc = makeModel({
  name: "cardUpvote",
  fields: {
    id: f.id<CardUpvoteId>(),
    type: f.string({}),
    createdAt: f.date({}),
    discordUserInfo: f.object({}),
    userId: f.belongsTo({}).type<UserId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
    cardId: f.belongsTo({}).type<CardId>(),
  },
  relations: {
    user: relation("user", {type: "belongsTo", fk: "userId"}),
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    card: relation("card", {type: "belongsTo", fk: "cardId"}),
  },
  keys: ["id"],
});
