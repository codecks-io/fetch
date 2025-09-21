import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import {type AccountId} from "./Account";
import {type DeckId} from "./Deck";
import {type UserId} from "./User";

export const assigneeDeckAssignmentDesc = makeModel({
  name: "assigneeDeckAssignment",
  fields: {
    lastAssignedAt: f.date({}),
    accountId: f.belongsTo({}).type<AccountId>(),
    deckId: f.belongsTo({}).type<DeckId>(),
    assigneeId: f.belongsTo({}).type<UserId>(),
    assignedById: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    deck: relation("deck", {type: "belongsTo", fk: "deckId"}),
    assignee: relation("user", {type: "belongsTo", fk: "assigneeId"}),
    assignedBy: relation("user", {type: "belongsTo", fk: "assignedById"}),
  },
  keys: ["assigneeId", "assignedById", "deckId"],
});
