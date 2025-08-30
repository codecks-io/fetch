
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type ProjectId } from "./Project";
import { type AccountId } from "./Account";


export const publicProjectInfoDesc = makeModel({
  name: "publicProjectInfo",
  fields: {
    lastActivityAt: f.string({}),
    activities7d: f.string({}),
    cardCount: f.string({}),
    visits7d: f.string({}),
    cardDoneStreak: f.string({}),
    projectId: f.belongsTo({}).type<ProjectId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    project: relation("project", { type: "belongsTo", fk: "projectId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["projectId"]
})