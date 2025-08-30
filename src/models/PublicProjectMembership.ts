
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type UserId } from "./User";
import { type ProjectId } from "./Project";


export const publicProjectMembershipDesc = makeModel({
  name: "publicProjectMembership",
  fields: {
    digestFrequencyInDays: f.int({}),
    createdAt: f.date({}),
    userId: f.belongsTo({}).type<UserId>(),
    projectId: f.belongsTo({}).type<ProjectId>(),
  },
  relations: {
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    project: relation("project", { type: "belongsTo", fk: "projectId" }),
  },
  keys: ["userId", "projectId"]
})