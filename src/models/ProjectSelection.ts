
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { userDesc } from "./User";
import { accountDesc } from "./Account";
import { projectDesc } from "./Project";

export type ProjectSelectionId = Nominal<string, "projectSelection">;
export const projectSelectionDesc = makeModel("projectSelection")
  .fields({
    id: f.id<ProjectSelectionId>(),
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => accountDesc),
    projectId: belongsTo("project", () => projectDesc),
  })
  .hasMany({
    
  })
  .key("id");
