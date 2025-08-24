
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { accountDesc } from "./Account";
import { userDesc } from "./User";


export const workflowItemHistoryDesc = makeModel("workflowItemHistory")
  .fields({
    diff: f.object<any>(),
    versionCreatedAt: f.date(),
    version: f.int(),
    accountId: belongsTo("account", () => accountDesc),
    changerId: belongsTo("changer", () => userDesc),
  })
  .hasMany({
    
  })
  .compoundKey("itemId", "version");
