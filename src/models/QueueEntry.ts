
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type AccountId } from "./Account";
import { type UserId } from "./User";
import { type CardId } from "./Card";

export type QueueEntryId = Nominal<string, "queueEntry">;
export const queueEntryDesc = makeModel({
  name: "queueEntry",
  fields: {
    id: f.id<QueueEntryId>(),
    sortIndex: f.int({}),
    cardDoneAt: f.date({}),
    createdAt: f.date({}),
    accountId: f.belongsTo({}).type<AccountId>(),
    userId: f.belongsTo({}).type<UserId>(),
    cardId: f.belongsTo({}).type<CardId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    card: relation("card", { type: "belongsTo", fk: "cardId" }),
  },
  keys: ["id"]
})