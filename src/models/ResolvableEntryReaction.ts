
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type ResolvableEntryId } from "./ResolvableEntry";
import { type AccountId } from "./Account";
import { type UserId } from "./User";
import { type ResolvableId } from "./Resolvable";

export type ResolvableEntryReactionId = Nominal<string, "resolvableEntryReaction">;
export const resolvableEntryReactionDesc = makeModel({
  name: "resolvableEntryReaction",
  fields: {
    id: f.id<ResolvableEntryReactionId>(),
    value: f.object({}),
    createdAt: f.date({}),
    isPublic: f.bool({}),
    resolvableEntryId: f.belongsTo().type<ResolvableEntryId>(),
    accountId: f.belongsTo().type<AccountId>(),
    userId: f.belongsTo().type<UserId>(),
    resolvableId: f.belongsTo().type<ResolvableId>(),
  },
  relations: {
    resolvableEntry: relation("resolvableEntry", { type: "belongsTo", fk: "resolvableEntryId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    resolvable: relation("resolvable", { type: "belongsTo", fk: "resolvableId" }),
  },
  keys: ["id"]
})