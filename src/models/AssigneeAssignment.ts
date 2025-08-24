
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { accountDesc } from "./Account";
import { userDesc } from "./User";


export const assigneeAssignmentDesc = makeModel("assigneeAssignment")
  .fields({
    lastAssignedAt: f.date(),
    accountId: belongsTo("account", () => accountDesc),
    assigneeId: belongsTo("assignee", () => userDesc),
    assignedById: belongsTo("assignedBy", () => userDesc),
  })
  .hasMany({
    
  })
  .compoundKey("assigneeId", "assignedById");
