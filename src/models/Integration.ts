
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { userDesc } from "./User";

export type IntegrationId = Nominal<string, "integration">;
export const integrationDesc = makeModel("integration")
  .fields({
    id: f.id<IntegrationId>(),
    type: f.string(),
    disabled: f.string(),
    userData: f.object<any>(),
    createdAt: f.date(),
    version: f.int(),
    accountId: belongsTo("account", () => accountDesc),
    userId: belongsTo("user", () => userDesc),
    creatorId: belongsTo("creator", () => userDesc),
  })
  .hasMany({
    
  })
  .key("id");
