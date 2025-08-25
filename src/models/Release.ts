
import { makeModel } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";

export type ReleaseId = Nominal<string, "release">;
export const releaseDesc = makeModel({
  name: "release",
  fields: {
    id: f.id<ReleaseId>(),
    version: f.string({}),
    isLive: f.string({}),
    content: f.string({}),
    title: f.string({}),
    createdAt: f.date({}),
    
  },
  relations: {
    
  },
  keys: ["id"]
})