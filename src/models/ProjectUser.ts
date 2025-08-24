
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { userDesc } from "./User";
import { projectDesc } from "./Project";
import { accountDesc } from "./Account";


export const projectUserDesc = makeModel("projectUser")
  .fields({
    projectRole: f.string(),
    userId: belongsTo("user", () => userDesc),
    projectId: belongsTo("project", () => projectDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .compoundKey("projectId", "userId");
