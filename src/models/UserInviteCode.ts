
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type AccountId } from "./Account";
import { type UserId } from "./User";

export type UserInviteCodeId = Nominal<string, "userInviteCode">;
export const userInviteCodeDesc = makeModel({
  name: "userInviteCode",
  fields: {
    id: f.id<UserInviteCodeId>(),
    token: f.string({}),
    role: f.string({}),
    useCount: f.string({}),
    isActive: f.string({}),
    accessToProjectIds: f.array({}),
    validUntil: f.date({}),
    createdAt: f.date({}),
    accountId: f.belongsTo().type<AccountId>(),
    creatorId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    creator: relation("user", { type: "belongsTo", fk: "creatorId" }),
  },
  keys: ["id"]
})