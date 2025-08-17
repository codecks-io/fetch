import { belongsTo, hasMany, makeModel } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountRoleDesc } from "./AccountRole";
import { userDesc } from "./User";

export type AccountId = Nominal<string, "account">;
export const accountDesc = makeModel("account")
  .fields({
    id: f.id<AccountId>(),
    name: f.string(),
    subdomain: f.string(),
    createdAt: f.date(),
    disabledAt: f.date({ optional: true }),
    disabledBy: belongsTo("disabledByUser", () => userDesc, { optional: true }),
  })
  .hasMany({
    roles: hasMany(() => accountRoleDesc),
  })
  .key("id");
