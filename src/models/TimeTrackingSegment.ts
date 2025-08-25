
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type CardId } from "./Card";
import { type UserId } from "./User";
import { type AccountId } from "./Account";

export type TimeTrackingSegmentId = Nominal<string, "timeTrackingSegment">;
export const timeTrackingSegmentDesc = makeModel({
  name: "timeTrackingSegment",
  fields: {
    id: f.id<TimeTrackingSegmentId>(),
    createdAt: f.date({}),
    finishedAt: f.date({ optional: true }),
    startedAt: f.date({}),
    modifyDurationMsBy: f.int({}),
    addedManually: f.string({}),
    autoFinishedState: f.string({}),
    cardId: f.belongsTo().type<CardId>(),
    userId: f.belongsTo().type<UserId>(),
    accountId: f.belongsTo().type<AccountId>(),
  },
  relations: {
    card: relation("card", { type: "belongsTo", fk: "cardId" }),
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["id"]
})