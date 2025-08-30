
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type UserId } from "./User";
import { type AccountId } from "./Account";
import { type DeckId } from "./Deck";


export const deckGuardianDesc = makeModel({
  name: "deckGuardian",
  fields: {
    
    userId: f.belongsTo({}).type<UserId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
    deckId: f.belongsTo({}).type<DeckId>(),
  },
  relations: {
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    deck: relation("deck", { type: "belongsTo", fk: "deckId" }),
  },
  keys: ["deckId", "userId"]
})