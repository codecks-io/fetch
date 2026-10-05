import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {ProjectId} from "./Project";

export type ProjectTagId = Nominal<string, "projectTag">;
/** A tag in a project's tag list. A card in the project with this tag lists it in `masterTags`. */
export const projectTagDesc = makeModel({
  name: "projectTag",
  fields: {
    /**
     * A hex color like `#ff0000` for cards with this tag. The web app sets either `color` or
     * `emoji`, not both.
     */
    color: f.string({optional: true}),
    createdAt: f.date({}),
    /** What the tag is for, as markdown. */
    description: f.string({optional: true}),
    emoji: f.string({optional: true}),
    id: f.id<ProjectTagId>(),
    projectId: f.belongsTo({}).type<ProjectId>(),
    /**
     * Without the `#`. Renaming it also renames the tag in the `content` and `masterTags` of the
     * project's cards.
     */
    tag: f.string({}),
  },
  relations: {
    project: relation("project", {type: "belongsTo", fk: "projectId"}),
  },
  keys: ["id"],
});
