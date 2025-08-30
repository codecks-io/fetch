
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type ProjectId } from "./Project";
import { type UserId } from "./User";


export const projectUserSettingDesc = makeModel({
  name: "projectUserSetting",
  fields: {
    
    projectId: f.belongsTo({}).type<ProjectId>(),
    userId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    project: relation("project", { type: "belongsTo", fk: "projectId" }),
    user: relation("user", { type: "belongsTo", fk: "userId" }),
  },
  keys: ["projectId", "userId"]
})