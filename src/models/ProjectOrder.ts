
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { userDesc } from "./User";
import { accountDesc } from "./Account";
import { projectDesc } from "./Project";


export const projectOrderDesc = makeModel("projectOrder")
  .fields({
    sortIndex: f.int(),
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => accountDesc),
    projectId: belongsTo("project", () => projectDesc),
  })
  .hasMany({
    
  })
  .compoundKey("projectId", "userId", "accountId");
