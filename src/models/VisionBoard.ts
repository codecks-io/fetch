
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type CardId } from "./Card";
import { type AccountId } from "./Account";
import { type UserId } from "./User";

export type VisionBoardId = Nominal<string, "visionBoard">;
export const visionBoardDesc = makeModel({
  name: "visionBoard",
  fields: {
    id: f.id<VisionBoardId>(),
    accountSeq: f.int({}),
    createdAt: f.date({}),
    isDeleted: f.bool({}),
    cardId: f.belongsTo({}).type<CardId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
    creatorId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    card: relation("card", { type: "belongsTo", fk: "cardId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    creator: relation("user", { type: "belongsTo", fk: "creatorId" }),
  },
  keys: ["id"]
})