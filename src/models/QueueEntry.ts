import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {AccountId} from "./Account";
import type {CardId} from "./Card";
import type {UserId} from "./User";

export type QueueEntryId = Nominal<string, "queueEntry">;
/**
 * A card in a user's Hand. When a card is done, its owner gets an entry in their Hand's done pile,
 * even if the card wasn't in their Hand.
 */
export const queueEntryDesc = makeModel({
  name: "queueEntry",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    /**
     * When the card was done. Other users' entries for the card are removed then. Setting the card
     * back to not done moves the entry to the end of the Hand.
     */
    cardDoneAt: f.date({optional: true}),
    cardId: f.belongsTo({}).type<CardId>(),
    createdAt: f.date({}),
    id: f.id<QueueEntryId>(),
    /** The position in the Hand, `0` is the first card. `null` once the card is done. */
    sortIndex: f.int({optional: true}),
    userId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    card: relation("card", {type: "belongsTo", fk: "cardId"}),
    user: relation("user", {type: "belongsTo", fk: "userId"}),
  },
  keys: ["id"],
});
