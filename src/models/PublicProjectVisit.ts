
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { projectDesc } from "./Project";


export const publicProjectVisitDesc = makeModel("publicProjectVisit")
  .fields({
    t: f.date(),
    topReferrers: f.object<any>(),
    visitCounts: f.int(),
    projectId: belongsTo("project", () => projectDesc),
  })
  .hasMany({
    
  })
  .compoundKey("t", "projectId");
