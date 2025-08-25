
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type AccountId } from "./Account";
import { type UserId } from "./User";


export const assigneeAssignmentDesc = makeModel({
  name: "assigneeAssignment",
  fields: {
    lastAssignedAt: f.date({}),
    accountId: f.belongsTo().type<AccountId>(),
    assigneeId: f.belongsTo({}).type<UserId>(),
    assignedById: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    assignee: relation("user", { type: "belongsTo", fk: "assigneeId" }),
    assignedBy: relation("user", { type: "belongsTo", fk: "assignedById" }),
  },
  keys: ["assigneeId", "assignedById"]
})