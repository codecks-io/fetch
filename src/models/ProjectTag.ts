
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { projectDesc } from "./Project";

export type ProjectTagId = Nominal<string, "projectTag">;
export const projectTagDesc = makeModel("projectTag")
  .fields({
    id: f.id<ProjectTagId>(),
    tag: f.string(),
    color: f.string({ optional: true }),
    emoji: f.string({ optional: true }),
    description: f.string({ optional: true }),
    createdAt: f.date(),
    projectId: belongsTo("project", () => projectDesc),
  })
  .hasMany({
    
  })
  .key("id");
