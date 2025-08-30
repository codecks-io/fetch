
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type CardId } from "./Card";
import { type AccountId } from "./Account";
import { type UserId } from "./User";

export type ResolvableId = Nominal<string, "resolvable">;
export const resolvableDesc = makeModel({
  name: "resolvable",
  fields: {
    id: f.id<ResolvableId>(),
    context: f.string({}),
    contextAsPrio: f.int({}),
    isClosed: f.bool({}),
    closedAt: f.date({ optional: true }),
    createdAt: f.date({}),
    isPublic: f.bool({}),
    cardId: f.belongsTo({}).type<CardId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
    creatorId: f.belongsTo({}).type<UserId>(),
    closedById: f.belongsTo({ optional: true }).type<UserId>(),
  },
  relations: {
    card: relation("card", { type: "belongsTo", fk: "cardId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    creator: relation("user", { type: "belongsTo", fk: "creatorId" }),
    closedBy: relation("user", { type: "belongsTo", fk: "closedById" }),
    participants: relation("resolvableParticipant", { type: "hasMany" }),
    participantHistories: relation("resolvableParticipantHistory", { type: "hasMany" }),
    entries: relation("resolvableEntry", { type: "hasMany" }),
  },
  keys: ["id"]
})