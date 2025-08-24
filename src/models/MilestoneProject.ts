
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { milestoneDesc } from "./Milestone";
import { projectDesc } from "./Project";
import { accountDesc } from "./Account";


export const milestoneProjectDesc = makeModel("milestoneProject")
  .fields({
    
    milestoneId: belongsTo("milestone", () => milestoneDesc),
    projectId: belongsTo("project", () => projectDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .compoundKey("milestoneId", "projectId");
