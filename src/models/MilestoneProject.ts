
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type MilestoneId } from "./Milestone";
import { type ProjectId } from "./Project";
import { type AccountId } from "./Account";


export const milestoneProjectDesc = makeModel({
  name: "milestoneProject",
  fields: {
    
    milestoneId: f.belongsTo({}).type<MilestoneId>(),
    projectId: f.belongsTo({}).type<ProjectId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    milestone: relation("milestone", { type: "belongsTo", fk: "milestoneId" }),
    project: relation("project", { type: "belongsTo", fk: "projectId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["milestoneId", "projectId"]
})