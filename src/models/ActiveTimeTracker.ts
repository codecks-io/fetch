
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type CardId } from "./Card";
import { type UserId } from "./User";
import { type AccountId } from "./Account";

export type ActiveTimeTrackerId = Nominal<string, "activeTimeTracker">;
export const activeTimeTrackerDesc = makeModel({
  name: "activeTimeTracker",
  fields: {
    id: f.id<ActiveTimeTrackerId>(),
    createdAt: f.date({}),
    cardId: f.belongsTo({}).type<CardId>(),
    userId: f.belongsTo({}).type<UserId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    card: relation("card", { type: "belongsTo", fk: "cardId" }),
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["id"]
})