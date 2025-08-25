
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type ResolvableId } from "./Resolvable";
import { type UserId } from "./User";
import { type ResolvableEntryId } from "./ResolvableEntry";


export const resolvableEntryHistoryDesc = makeModel({
  name: "resolvableEntryHistory",
  fields: {
    content: f.string({}),
    lastChangedAt: f.date({}),
    version: f.int({}),
    resolvableId: f.belongsTo().type<ResolvableId>(),
    authorId: f.belongsTo({}).type<UserId>(),
    entryId: f.belongsTo({}).type<ResolvableEntryId>(),
  },
  relations: {
    resolvable: relation("resolvable", { type: "belongsTo", fk: "resolvableId" }),
    author: relation("user", { type: "belongsTo", fk: "authorId" }),
    entry: relation("resolvableEntry", { type: "belongsTo", fk: "entryId" }),
  },
  keys: ["entryId", "version"]
})