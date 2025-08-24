
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { userDesc } from "./User";
import { projectDesc } from "./Project";


export const publicProjectMembershipDesc = makeModel("publicProjectMembership")
  .fields({
    digestFrequencyInDays: f.int(),
    createdAt: f.date(),
    userId: belongsTo("user", () => userDesc),
    projectId: belongsTo("project", () => projectDesc),
  })
  .hasMany({
    
  })
  .compoundKey("userId", "projectId");
