import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import {type ProjectId} from "./Project";

export const publicProjectVisitDesc = makeModel({
  name: "publicProjectVisit",
  fields: {
    t: f.date({}),
    topReferrers: f.object({}),
    visitCounts: f.int({}),
    projectId: f.belongsTo({}).type<ProjectId>(),
  },
  relations: {
    project: relation("project", {type: "belongsTo", fk: "projectId"}),
  },
  keys: ["t", "projectId"],
});
