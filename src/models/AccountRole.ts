import { belongsTo, makeModel } from "./_desc";
import { userDesc } from "./User";
import * as f from "./_fields";

export const accountRoleDesc = makeModel("accountRole")
  .fields({
    role: f.string(),
    createdAt: f.date(),
    lastChangedAt: f.date(),
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => userDesc),
  })
  .hasMany({})
  .compoundKey("accountId", "userId");
