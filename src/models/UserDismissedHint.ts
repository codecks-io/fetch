import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import {type UserId} from "./User";

export const userDismissedHintDesc = makeModel({
  name: "userDismissedHint",
  fields: {
    hintKey: f.string({}),
    createdAt: f.date({}),
    returnAt: f.date({}),
    userId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    user: relation("user", {type: "belongsTo", fk: "userId"}),
  },
  keys: ["userId", "hintKey"],
});
