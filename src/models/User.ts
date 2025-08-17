import { hasMany, makeModel } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountRoleDesc } from "./AccountRole";

export type UserId = Nominal<string, "user">;
export const userDesc = makeModel("user")
  .fields({
    id: f.id<UserId>(),
    name: f.string(),
    fullName: f.string(),
    createdAt: f.date(),
  })
  .hasMany({
    accountRoles: hasMany(() => accountRoleDesc),
  })
  .key("id");
