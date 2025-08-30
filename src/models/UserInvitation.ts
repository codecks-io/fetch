
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type AccountId } from "./Account";
import { type UserId } from "./User";

export type UserInvitationId = Nominal<string, "userInvitation">;
export const userInvitationDesc = makeModel({
  name: "userInvitation",
  fields: {
    id: f.id<UserInvitationId>(),
    email: f.string({}),
    role: f.string({}),
    accessToProjectIds: f.array({}),
    createdAt: f.date({}),
    accountId: f.belongsTo({}).type<AccountId>(),
    inviterId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    inviter: relation("user", { type: "belongsTo", fk: "inviterId" }),
  },
  keys: ["id"]
})