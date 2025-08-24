
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { projectDesc } from "./Project";


export const dailyPublicProjectMembershipDesc = makeModel("dailyPublicProjectMembership")
  .fields({
    t: f.date(),
    membershipCount: f.int(),
    projectId: belongsTo("project", () => projectDesc),
  })
  .hasMany({
    
  })
  .compoundKey("t", "projectId");
