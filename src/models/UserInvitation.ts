
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { userDesc } from "./User";

export type UserInvitationId = Nominal<string, "userInvitation">;
export const userInvitationDesc = makeModel("userInvitation")
  .fields({
    id: f.id<UserInvitationId>(),
    email: f.string(),
    role: f.string(),
    accessToProjectIds: f.array<any>(),
    createdAt: f.date(),
    accountId: belongsTo("account", () => accountDesc),
    inviterId: belongsTo("inviter", () => userDesc),
  })
  .hasMany({
    
  })
  .key("id");
