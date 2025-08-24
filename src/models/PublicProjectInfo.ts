
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { projectDesc } from "./Project";
import { accountDesc } from "./Account";


export const publicProjectInfoDesc = makeModel("publicProjectInfo")
  .fields({
    lastActivityAt: f.string(),
    activities7d: f.string(),
    cardCount: f.string(),
    visits7d: f.string(),
    cardDoneStreak: f.string(),
    projectId: belongsTo("project", () => projectDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .compoundKey("projectId");
