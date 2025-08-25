
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type AccountId } from "./Account";
import { type UserId } from "./User";

export type CardPresetId = Nominal<string, "cardPreset">;
export const cardPresetDesc = makeModel({
  name: "cardPreset",
  fields: {
    id: f.id<CardPresetId>(),
    name: f.string({}),
    data: f.object({}),
    createdAt: f.date({}),
    accountId: f.belongsTo().type<AccountId>(),
    creatorId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    creator: relation("user", { type: "belongsTo", fk: "creatorId" }),
  },
  keys: ["id"]
})