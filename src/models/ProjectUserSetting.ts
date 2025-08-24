
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { projectDesc } from "./Project";
import { userDesc } from "./User";


export const projectUserSettingDesc = makeModel("projectUserSetting")
  .fields({
    
    projectId: belongsTo("project", () => projectDesc),
    userId: belongsTo("user", () => userDesc),
  })
  .hasMany({
    
  })
  .compoundKey("projectId", "userId");
