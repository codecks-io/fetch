
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { userDesc } from "./User";

export type SavedSearchId = Nominal<string, "savedSearch">;
export const savedSearchDesc = makeModel("savedSearch")
  .fields({
    id: f.id<SavedSearchId>(),
    tokens: f.array<any>(),
    forceOr: f.bool(),
    accountId: belongsTo("account", () => accountDesc),
    ownerId: belongsTo("owner", () => userDesc),
  })
  .hasMany({
    
  })
  .key("id");
