
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { accountDesc } from "./Account";
import { userDesc } from "./User";


export const accountUserAchievementDesc = makeModel("accountUserAchievement")
  .fields({
    value: f.object<any>(),
    context: f.object<any>(),
    accountId: belongsTo("account", () => accountDesc),
    userId: belongsTo("user", () => userDesc),
  })
  .hasMany({
    
  })
  .compoundKey("accountId", "userId", "key");
