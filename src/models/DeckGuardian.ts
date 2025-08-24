
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { userDesc } from "./User";
import { accountDesc } from "./Account";
import { deckDesc } from "./Deck";


export const deckGuardianDesc = makeModel("deckGuardian")
  .fields({
    
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => accountDesc),
    deckId: belongsTo("deck", () => deckDesc),
  })
  .hasMany({
    
  })
  .compoundKey("deckId", "userId");
