import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {AccountId} from "./Account";
import type {CardId} from "./Card";
import type {UserId} from "./User";

export type ResolvableId = Nominal<string, "resolvable">;
export const resolvableDesc = makeModel({
  name: "resolvable",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    cardId: f.belongsTo({}).type<CardId>(),
    closedAt: f.date({optional: true}),
    context: f.typed({}).type<"block" | "review" | "comment" | (string & {})>(),
    createdAt: f.date({}),
    creatorId: f.belongsTo({}).type<UserId>(),
    id: f.id<ResolvableId>(),
    isClosed: f.bool({}),
    reopenedAt: f.date({optional: true}),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    card: relation("card", {type: "belongsTo", fk: "cardId"}),
    closedBy: relation("user", {type: "belongsTo", optional: true}),
    creator: relation("user", {type: "belongsTo", fk: "creatorId"}),
    entries: relation("resolvableEntry", {type: "hasMany"}),
    reopenedBy: relation("user", {type: "belongsTo", optional: true}),
  },
  keys: ["id"],
});
