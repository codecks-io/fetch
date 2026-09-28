import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {ProjectId} from "./Project";

export type ProjectTagId = Nominal<string, "projectTag">;
export const projectTagDesc = makeModel({
  name: "projectTag",
  fields: {
    color: f.string({optional: true}),
    createdAt: f.date({}),
    description: f.string({optional: true}),
    emoji: f.string({optional: true}),
    id: f.id<ProjectTagId>(),
    projectId: f.belongsTo({}).type<ProjectId>(),
    tag: f.string({}),
  },
  relations: {
    project: relation("project", {type: "belongsTo", fk: "projectId"}),
  },
  keys: ["id"],
});
