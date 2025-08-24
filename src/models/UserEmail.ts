
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { userDesc } from "./User";

export type UserEmailId = Nominal<string, "userEmail">;
export const userEmailDesc = makeModel("userEmail")
  .fields({
    id: f.id<UserEmailId>(),
    email: f.string(),
    createdAt: f.date(),
    isPrimary: f.bool(),
    isVerified: f.bool(),
    userId: belongsTo("user", () => userDesc),
  })
  .hasMany({
    
  })
  .key("id");
