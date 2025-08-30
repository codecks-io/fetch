
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type UserId } from "./User";
import { type AccountId } from "./Account";
import { type CardId } from "./Card";


export const handCardDesc = makeModel({
  name: "handCard",
  fields: {
    sortIndex: f.int({}),
    userId: f.belongsTo({}).type<UserId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
    cardId: f.belongsTo({}).type<CardId>(),
  },
  relations: {
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    card: relation("card", { type: "belongsTo", fk: "cardId" }),
  },
  keys: ["cardId", "userId", "accountId"]
})