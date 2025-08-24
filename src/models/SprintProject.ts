
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { sprintConfigDesc } from "./SprintConfig";
import { projectDesc } from "./Project";
import { accountDesc } from "./Account";


export const sprintProjectDesc = makeModel("sprintProject")
  .fields({
    
    sprintConfigId: belongsTo("sprintConfig", () => sprintConfigDesc),
    projectId: belongsTo("project", () => projectDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .compoundKey("sprintConfigId", "projectId");
