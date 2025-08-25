
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type AccountId } from "./Account";
import { type CardId } from "./Card";
import { type UserId } from "./User";


export const cardHistoryDesc = makeModel({
  name: "cardHistory",
  fields: {
    diff: f.object({}),
    versionCreatedAt: f.date({}),
    version: f.int({}),
    accountId: f.belongsTo().type<AccountId>(),
    cardId: f.belongsTo().type<CardId>(),
    changerId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    card: relation("card", { type: "belongsTo", fk: "cardId" }),
    changer: relation("user", { type: "belongsTo", fk: "changerId" }),
  },
  keys: ["cardId", "version"]
})