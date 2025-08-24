
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { cardDesc } from "./Card";
import { deckDesc } from "./Deck";
import { userDesc } from "./User";


export const cardOrderInDeckDesc = makeModel("cardOrderInDeck")
  .fields({
    sortIndex: f.string(),
    cardId: belongsTo("card", () => cardDesc),
    deckId: belongsTo("deck", () => deckDesc),
    changerId: belongsTo("changer", () => userDesc),
  })
  .hasMany({
    
  })
  .compoundKey("cardId", "deckId");
