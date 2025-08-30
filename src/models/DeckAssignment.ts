
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type DeckId } from "./Deck";
import { type UserId } from "./User";
import { type AccountId } from "./Account";


export const deckAssignmentDesc = makeModel({
  name: "deckAssignment",
  fields: {
    lastAssignedAt: f.date({}),
    deckId: f.belongsTo({}).type<DeckId>(),
    userId: f.belongsTo({}).type<UserId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    deck: relation("deck", { type: "belongsTo", fk: "deckId" }),
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["userId", "deckId"]
})