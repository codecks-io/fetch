
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type UserId } from "./User";
import { type AccountId } from "./Account";


export const lastSeenCardUpvoteDesc = makeModel({
  name: "lastSeenCardUpvote",
  fields: {
    lastSeenAt: f.date({}),
    createdAt: f.date({}),
    userId: f.belongsTo({}).type<UserId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["userId", "accountId"]
})