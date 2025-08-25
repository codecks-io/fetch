
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type ProjectId } from "./Project";


export const dailyPublicProjectMembershipDesc = makeModel({
  name: "dailyPublicProjectMembership",
  fields: {
    t: f.date({}),
    membershipCount: f.int({}),
    projectId: f.belongsTo().type<ProjectId>(),
  },
  relations: {
    project: relation("project", { type: "belongsTo", fk: "projectId" }),
  },
  keys: ["t", "projectId"]
})