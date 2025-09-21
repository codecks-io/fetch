import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import {type UserId} from "./User";

export const cardsFinishedHistoryDesc = makeModel({
  name: "cardsFinishedHistory",
  fields: {
    effortSum: f.bigint({}),
    cardCount: f.bigint({}),
    date: f.day({}),
    assigneeId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    assignee: relation("user", {type: "belongsTo", fk: "assigneeId"}),
  },
  keys: ["date", "effortSum", "cardCount", "assigneeId"],
});
