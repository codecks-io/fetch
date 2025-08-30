
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type CardId } from "./Card";
import { type DeckId } from "./Deck";
import { type UserId } from "./User";


export const cardOrderInDeckDesc = makeModel({
  name: "cardOrderInDeck",
  fields: {
    sortIndex: f.string({}),
    cardId: f.belongsTo({}).type<CardId>(),
    deckId: f.belongsTo({}).type<DeckId>(),
    changerId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    card: relation("card", { type: "belongsTo", fk: "cardId" }),
    deck: relation("deck", { type: "belongsTo", fk: "deckId" }),
    changer: relation("user", { type: "belongsTo", fk: "changerId" }),
  },
  keys: ["cardId", "deckId"]
})