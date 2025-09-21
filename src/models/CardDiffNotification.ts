import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import {type UserId} from "./User";
import {type CardId} from "./Card";
import {type AccountId} from "./Account";

export const cardDiffNotificationDesc = makeModel({
  name: "cardDiffNotification",
  fields: {
    changes: f.object({}),
    asOwner: f.bool({}),
    changers: f.array({}),
    lastUpdatedAt: f.date({}),
    createdAt: f.date({}),
    userId: f.belongsTo({}).type<UserId>(),
    cardId: f.belongsTo({}).type<CardId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    user: relation("user", {type: "belongsTo", fk: "userId"}),
    card: relation("card", {type: "belongsTo", fk: "cardId"}),
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
  },
  keys: ["userId", "cardId"],
});
