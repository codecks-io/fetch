
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type ResolvableId } from "./Resolvable";
import { type CardId } from "./Card";
import { type UserId } from "./User";

export type ResolvableEntryId = Nominal<string, "resolvableEntry">;
export const resolvableEntryDesc = makeModel({
  name: "resolvableEntry",
  fields: {
    entryId: f.id<ResolvableEntryId>(),
    content: f.string({}),
    lastChangedAt: f.date({}),
    createdAt: f.date({}),
    version: f.int({}),
    meta: f.object({}),
    resolvableId: f.belongsTo().type<ResolvableId>(),
    cardId: f.belongsTo().type<CardId>(),
    authorId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    resolvable: relation("resolvable", { type: "belongsTo", fk: "resolvableId" }),
    card: relation("card", { type: "belongsTo", fk: "cardId" }),
    author: relation("user", { type: "belongsTo", fk: "authorId" }),
    reactions: relation("resolvableEntryReaction", { type: "hasMany" }),
    histories: relation("resolvableEntryHistory", { type: "hasMany" }),
  },
  keys: ["entryId"]
})