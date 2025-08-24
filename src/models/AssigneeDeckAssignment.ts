
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { accountDesc } from "./Account";
import { deckDesc } from "./Deck";
import { userDesc } from "./User";


export const assigneeDeckAssignmentDesc = makeModel("assigneeDeckAssignment")
  .fields({
    lastAssignedAt: f.date(),
    accountId: belongsTo("account", () => accountDesc),
    deckId: belongsTo("deck", () => deckDesc),
    assigneeId: belongsTo("assignee", () => userDesc),
    assignedById: belongsTo("assignedBy", () => userDesc),
  })
  .hasMany({
    
  })
  .compoundKey("assigneeId", "assignedById", "deckId");
