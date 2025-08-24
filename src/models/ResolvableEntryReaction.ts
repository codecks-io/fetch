
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { resolvableEntryDesc } from "./ResolvableEntry";
import { accountDesc } from "./Account";
import { userDesc } from "./User";
import { resolvableDesc } from "./Resolvable";

export type ResolvableEntryReactionId = Nominal<string, "resolvableEntryReaction">;
export const resolvableEntryReactionDesc = makeModel("resolvableEntryReaction")
  .fields({
    id: f.id<ResolvableEntryReactionId>(),
    value: f.object<any>(),
    createdAt: f.date(),
    isPublic: f.bool(),
    resolvableEntryId: belongsTo("resolvableEntry", () => resolvableEntryDesc),
    accountId: belongsTo("account", () => accountDesc),
    userId: belongsTo("user", () => userDesc),
    resolvableId: belongsTo("resolvable", () => resolvableDesc),
  })
  .hasMany({
    
  })
  .key("id");
