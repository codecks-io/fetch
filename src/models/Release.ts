import {makeModel} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";

export type ReleaseId = Nominal<string, "release">;
export const releaseDesc = makeModel({
  name: "release",
  fields: {
    content: f.string({}),
    createdAt: f.date({}),
    id: f.id<ReleaseId>(),
    title: f.string({}),
    version: f.string({}),
  },
  relations: {},
  keys: ["id"],
});
