
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { userDesc } from "./User";
import { projectDesc } from "./Project";


export const userProjectAccessDesc = makeModel("userProjectAccess")
  .fields({
    role: f.string(),
    projectRole: f.string(),
    userId: belongsTo("user", () => userDesc),
    projectId: belongsTo("project", () => projectDesc),
  })
  .hasMany({
    
  })
  .compoundKey("projectId", "userId");
