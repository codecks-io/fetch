
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type UserId } from "./User";
import { type AccountId } from "./Account";

export type UserTagId = Nominal<string, "userTag">;
export const userTagDesc = makeModel({
  name: "userTag",
  fields: {
    id: f.id<UserTagId>(),
    tag: f.string({}),
    createdAt: f.date({}),
    userId: f.belongsTo({}).type<UserId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["id"]
})