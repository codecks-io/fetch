
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { userDesc } from "./User";

export type UserInviteCodeId = Nominal<string, "userInviteCode">;
export const userInviteCodeDesc = makeModel("userInviteCode")
  .fields({
    id: f.id<UserInviteCodeId>(),
    token: f.string(),
    role: f.string(),
    useCount: f.string(),
    isActive: f.string(),
    accessToProjectIds: f.array<any>(),
    validUntil: f.date(),
    createdAt: f.date(),
    accountId: belongsTo("account", () => accountDesc),
    creatorId: belongsTo("creator", () => userDesc),
  })
  .hasMany({
    
  })
  .key("id");
