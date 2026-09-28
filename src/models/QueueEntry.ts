import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {AccountId} from "./Account";
import type {CardId} from "./Card";
import type {UserId} from "./User";

export type QueueEntryId = Nominal<string, "queueEntry">;
export const queueEntryDesc = makeModel({
  name: "queueEntry",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    cardDoneAt: f.date({optional: true}),
    cardId: f.belongsTo({}).type<CardId>(),
    createdAt: f.date({}),
    id: f.id<QueueEntryId>(),
    sortIndex: f.int({}),
    userId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    card: relation("card", {type: "belongsTo", fk: "cardId"}),
    user: relation("user", {type: "belongsTo", fk: "userId"}),
  },
  keys: ["id"],
});
