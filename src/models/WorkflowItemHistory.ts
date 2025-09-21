import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import {type AccountId} from "./Account";
import {type UserId} from "./User";

export const workflowItemHistoryDesc = makeModel({
  name: "workflowItemHistory",
  fields: {
    diff: f.object({}),
    versionCreatedAt: f.date({}),
    version: f.int({}),
    accountId: f.belongsTo({}).type<AccountId>(),
    changerId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    changer: relation("user", {type: "belongsTo", fk: "changerId"}),
  },
  keys: ["itemId", "version"],
});
