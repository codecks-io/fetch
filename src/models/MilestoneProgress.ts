
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { milestoneDesc } from "./Milestone";


export const milestoneProgressDesc = makeModel("milestoneProgress")
  .fields({
    progress: f.object<any>(),
    milestoneId: belongsTo("milestone", () => milestoneDesc),
  })
  .hasMany({
    
  })
  .compoundKey("milestoneId", "date");
