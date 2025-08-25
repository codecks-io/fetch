
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type CardId } from "./Card";
import { type AccountId } from "./Account";


export const cardOrderDesc = makeModel({
  name: "cardOrder",
  fields: {
    sortValue: f.string({}),
    label: f.string({}),
    cardId: f.belongsTo().type<CardId>(),
    accountId: f.belongsTo().type<AccountId>(),
  },
  relations: {
    card: relation("card", { type: "belongsTo", fk: "cardId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["context", "cardId"]
})