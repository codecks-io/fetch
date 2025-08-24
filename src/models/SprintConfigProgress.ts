
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { sprintConfigDesc } from "./SprintConfig";


export const sprintConfigProgressDesc = makeModel("sprintConfigProgress")
  .fields({
    progress: f.object<any>(),
    sprintConfigId: belongsTo("sprintConfig", () => sprintConfigDesc),
  })
  .hasMany({
    
  })
  .compoundKey("sprintConfigId", "date");
