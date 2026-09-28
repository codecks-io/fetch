import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {CardId} from "./Card";
import type {ResolvableId} from "./Resolvable";
import type {UserId} from "./User";

export type ResolvableEntryId = Nominal<string, "resolvableEntry">;
export const resolvableEntryDesc = makeModel({
  name: "resolvableEntry",
  fields: {
    authorId: f.belongsTo({}).type<UserId>(),
    cardId: f.belongsTo({}).type<CardId>(),
    content: f.string({}),
    createdAt: f.date({}),
    entryId: f.id<ResolvableEntryId>(),
    lastChangedAt: f.date({}),
    resolvableId: f.belongsTo({}).type<ResolvableId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
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
