import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {AccountId} from "./Account";
import type {CardId} from "./Card";
import type {UserId} from "./User";

export const handCardDesc = makeModel({
  name: "handCard",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    cardId: f.belongsTo({}).type<CardId>(),
    sortIndex: f.int({}),
    userId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    card: relation("card", {type: "belongsTo", fk: "cardId"}),
    user: relation("user", {type: "belongsTo", fk: "userId"}),
  },
  keys: ["cardId", "userId", "accountId"],
});
