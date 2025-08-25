
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type UserId } from "./User";
import { type AccountId } from "./Account";

export type QueueSelectionId = Nominal<string, "queueSelection">;
export const queueSelectionDesc = makeModel({
  name: "queueSelection",
  fields: {
    id: f.id<QueueSelectionId>(),
    sortIndex: f.int({}),
    userId: f.belongsTo().type<UserId>(),
    accountId: f.belongsTo().type<AccountId>(),
    queueUserId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    queueUser: relation("user", { type: "belongsTo", fk: "queueUserId" }),
  },
  keys: ["id"]
})