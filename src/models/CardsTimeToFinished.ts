import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import {type CardId} from "./Card";
import {type UserId} from "./User";

export const cardsTimeToFinishedDesc = makeModel({
  name: "cardsTimeToFinished",
  fields: {
    effort: f.int({}),
    startedAt: f.date({}),
    doneAt: f.date({}),
    cardId: f.belongsTo({}).type<CardId>(),
    assigneeId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    card: relation("card", {type: "belongsTo", fk: "cardId"}),
    assignee: relation("user", {type: "belongsTo", fk: "assigneeId"}),
  },
  keys: ["cardId", "startedAt", "doneAt", "effort", "assigneeId"],
});
