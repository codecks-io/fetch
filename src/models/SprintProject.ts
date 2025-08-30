
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type SprintConfigId } from "./SprintConfig";
import { type ProjectId } from "./Project";
import { type AccountId } from "./Account";


export const sprintProjectDesc = makeModel({
  name: "sprintProject",
  fields: {
    
    sprintConfigId: f.belongsTo({}).type<SprintConfigId>(),
    projectId: f.belongsTo({}).type<ProjectId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    sprintConfig: relation("sprintConfig", { type: "belongsTo", fk: "sprintConfigId" }),
    project: relation("project", { type: "belongsTo", fk: "projectId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["sprintConfigId", "projectId"]
})