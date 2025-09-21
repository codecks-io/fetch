import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import {type CardId} from "./Card";
import {type UserId} from "./User";

export const timeTrackingSumDesc = makeModel({
  name: "timeTrackingSum",
  fields: {
    sumMs: f.int({}),
    runningStartedAt: f.date({}),
    runningModifyDurationMsBy: f.int({}),
    cardId: f.belongsTo({}).type<CardId>(),
    userId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    card: relation("card", {type: "belongsTo", fk: "cardId"}),
    user: relation("user", {type: "belongsTo", fk: "userId"}),
  },
  keys: ["cardId", "userId"],
});
