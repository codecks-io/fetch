
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type AccountId } from "./Account";
import { type UserId } from "./User";


export const accountUserAchievementDesc = makeModel({
  name: "accountUserAchievement",
  fields: {
    value: f.object({}),
    context: f.object({}),
    accountId: f.belongsTo({}).type<AccountId>(),
    userId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    user: relation("user", { type: "belongsTo", fk: "userId" }),
  },
  keys: ["accountId", "userId", "key"]
})