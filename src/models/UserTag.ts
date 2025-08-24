
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { userDesc } from "./User";
import { accountDesc } from "./Account";

export type UserTagId = Nominal<string, "userTag">;
export const userTagDesc = makeModel("userTag")
  .fields({
    id: f.id<UserTagId>(),
    tag: f.string(),
    createdAt: f.date(),
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .key("id");
