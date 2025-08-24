
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { sprintDesc } from "./Sprint";


export const sprintProgressDesc = makeModel("sprintProgress")
  .fields({
    progress: f.object<any>(),
    sprintId: belongsTo("sprint", () => sprintDesc),
  })
  .hasMany({
    
  })
  .compoundKey("sprintId", "date");
