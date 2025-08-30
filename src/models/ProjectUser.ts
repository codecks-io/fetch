
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type UserId } from "./User";
import { type ProjectId } from "./Project";
import { type AccountId } from "./Account";


export const projectUserDesc = makeModel({
  name: "projectUser",
  fields: {
    projectRole: f.string({}),
    userId: f.belongsTo({}).type<UserId>(),
    projectId: f.belongsTo({}).type<ProjectId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    project: relation("project", { type: "belongsTo", fk: "projectId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["projectId", "userId"]
})