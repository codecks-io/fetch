import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {AccountId} from "./Account";
import type {MilestoneId} from "./Milestone";
import type {ProjectId} from "./Project";

export const milestoneProjectDesc = makeModel({
  name: "milestoneProject",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    milestoneId: f.belongsTo({}).type<MilestoneId>(),
    projectId: f.belongsTo({}).type<ProjectId>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    milestone: relation("milestone", {type: "belongsTo", fk: "milestoneId"}),
    project: relation("project", {type: "belongsTo", fk: "projectId"}),
  },
  keys: ["milestoneId", "projectId"],
});
