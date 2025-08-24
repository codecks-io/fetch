
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { userDesc } from "./User";
import { accountDesc } from "./Account";


export const lastSeenCardUpvoteDesc = makeModel("lastSeenCardUpvote")
  .fields({
    lastSeenAt: f.date(),
    createdAt: f.date(),
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .compoundKey("userId", "accountId");
