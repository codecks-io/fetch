import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import {type UserId} from "./User";
import {type AccountId} from "./Account";
import {type CardId} from "./Card";
import {type TimeTrackingSegmentId} from "./TimeTrackingSegment";

export const autoFinishedTimeTrackingSegmentDesc = makeModel({
  name: "autoFinishedTimeTrackingSegment",
  fields: {
    createdAt: f.date({}),
    userId: f.belongsTo({}).type<UserId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
    cardId: f.belongsTo({}).type<CardId>(),
    timeTrackingSegmentId: f.belongsTo({}).type<TimeTrackingSegmentId>(),
  },
  relations: {
    user: relation("user", {type: "belongsTo", fk: "userId"}),
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    card: relation("card", {type: "belongsTo", fk: "cardId"}),
    timeTrackingSegment: relation("timeTrackingSegment", {
      type: "belongsTo",
      fk: "timeTrackingSegmentId",
    }),
  },
  keys: ["userId", "accountId"],
});
