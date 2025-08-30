
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type CardId } from "./Card";
import { type AccountId } from "./Account";

export type VisionBoardQueryId = Nominal<string, "visionBoardQuery">;
export const visionBoardQueryDesc = makeModel({
  name: "visionBoardQuery",
  fields: {
    id: f.id<VisionBoardQueryId>(),
    query: f.object({}),
    lastUsedAt: f.date({}),
    isStale: f.bool({}),
    type: f.string({}),
    payload: f.object({}),
    createdAt: f.date({}),
    cardId: f.belongsTo({}).type<CardId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    card: relation("card", { type: "belongsTo", fk: "cardId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["id"]
})