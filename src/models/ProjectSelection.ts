import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import {type UserId} from "./User";
import {type AccountId} from "./Account";
import {type ProjectId} from "./Project";

export type ProjectSelectionId = Nominal<string, "projectSelection">;
export const projectSelectionDesc = makeModel({
  name: "projectSelection",
  fields: {
    id: f.id<ProjectSelectionId>(),
    userId: f.belongsTo({}).type<UserId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
    projectId: f.belongsTo({}).type<ProjectId>(),
  },
  relations: {
    user: relation("user", {type: "belongsTo", fk: "userId"}),
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    project: relation("project", {type: "belongsTo", fk: "projectId"}),
  },
  keys: ["id"],
});
