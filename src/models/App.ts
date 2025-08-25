
import { makeModel } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";

export type AppId = Nominal<string, "app">;
export const appDesc = makeModel({
  name: "app",
  fields: {
    id: f.id<AppId>(),
    name: f.string({}),
    createdAt: f.date({}),
    payload: f.object({}),
    
  },
  relations: {
    
  },
  keys: ["id"]
})