import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {CardId} from "./Card";
import type {ResolvableId} from "./Resolvable";
import type {UserId} from "./User";

export type ResolvableEntryId = Nominal<string, "resolvableEntry">;
/** A comment in a comment thread. */
export const resolvableEntryDesc = makeModel({
  name: "resolvableEntry",
  fields: {
    authorId: f.belongsTo({}).type<UserId>(),
    cardId: f.belongsTo({}).type<CardId>(),
    /** Markdown. Mentions are stored as `@[userId:<id>]`. */
    content: f.string({}),
    createdAt: f.date({}),
    entryId: f.id<ResolvableEntryId>(),
    /** When the comment was last edited. Same as `createdAt` if it never was. */
    lastChangedAt: f.date({}),
    resolvableId: f.belongsTo({}).type<ResolvableId>(),
    /**
     * Starts at 1 and goes up with every edit.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    version: f.int({stability: "preview"}),
  },
  relations: {
    author: relation("user", {type: "belongsTo", fk: "authorId"}),
    card: relation("card", {type: "belongsTo", fk: "cardId"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    reactions: relation("resolvableEntryReaction", {type: "hasMany", stability: "preview"}),
    resolvable: relation("resolvable", {type: "belongsTo", fk: "resolvableId"}),
  },
  keys: ["entryId"],
});
