import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {AccountId} from "./Account";
import type {ProjectId} from "./Project";
import type {SprintConfigId} from "./SprintConfig";

export const sprintProjectDesc = makeModel({
  name: "sprintProject",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    projectId: f.belongsTo({}).type<ProjectId>(),
    sprintConfigId: f.belongsTo({}).type<SprintConfigId>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    project: relation("project", {type: "belongsTo", fk: "projectId"}),
    sprintConfig: relation("sprintConfig", {type: "belongsTo", fk: "sprintConfigId"}),
  },
  keys: ["sprintConfigId", "projectId"],
});
