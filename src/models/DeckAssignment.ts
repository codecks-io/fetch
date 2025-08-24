
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { deckDesc } from "./Deck";
import { userDesc } from "./User";
import { accountDesc } from "./Account";


export const deckAssignmentDesc = makeModel("deckAssignment")
  .fields({
    lastAssignedAt: f.date(),
    deckId: belongsTo("deck", () => deckDesc),
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .compoundKey("userId", "deckId");
