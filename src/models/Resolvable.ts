import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {AccountId} from "./Account";
import type {CardId} from "./Card";
import type {UserId} from "./User";

export type ResolvableId = Nominal<string, "resolvable">;
/**
 * A comment thread on a card. Its `context` says if it's a plain conversation or if it marks the
 * card as blocked or in review.
 */
export const resolvableDesc = makeModel({
  name: "resolvable",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    cardId: f.belongsTo({}).type<CardId>(),
    closedAt: f.date({optional: true}),
    /**
     * `block` marks the card as blocked and `review` marks it as in review while the thread is open
     * (see `card.derivedStatus`). `comment` is a plain conversation.
     */
    context: f.typed({}).type<"block" | "review" | "comment" | (string & {})>(),
    createdAt: f.date({}),
    creatorId: f.belongsTo({}).type<UserId>(),
    id: f.id<ResolvableId>(),
    /** Archiving or deleting the card closes its open threads. */
    isClosed: f.bool({}),
    /** Only set while the thread is open again after being closed. Closing it clears the value. */
    reopenedAt: f.date({optional: true}),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    card: relation("card", {type: "belongsTo", fk: "cardId"}),
    /** `null` while the thread is open, or when it was closed automatically. */
    closedBy: relation("user", {type: "belongsTo", optional: true}),
    creator: relation("user", {type: "belongsTo", fk: "creatorId"}),
    entries: relation("resolvableEntry", {type: "hasMany"}),
    /** Only set while the thread is open again after being closed. */
    reopenedBy: relation("user", {type: "belongsTo", optional: true}),
  },
  keys: ["id"],
});
