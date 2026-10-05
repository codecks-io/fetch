import {makeModel} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";

export type ReleaseId = Nominal<string, "release">;
/** An entry in the Codecks changelog. It's the same for every organization. */
export const releaseDesc = makeModel({
  name: "release",
  fields: {
    /** The release notes as markdown. */
    content: f.string({}),
    createdAt: f.date({}),
    id: f.id<ReleaseId>(),
    title: f.string({}),
    version: f.string({}),
  },
  relations: {},
  keys: ["id"],
});
