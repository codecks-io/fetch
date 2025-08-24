
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { appDesc } from "./App";
import { userDesc } from "./User";

export type AppInstallationId = Nominal<string, "appInstallation">;
export const appInstallationDesc = makeModel("appInstallation")
  .fields({
    id: f.id<AppInstallationId>(),
    createdAt: f.date(),
    accountId: belongsTo("account", () => accountDesc),
    appId: belongsTo("app", () => appDesc),
    installerId: belongsTo("installer", () => userDesc),
  })
  .hasMany({
    
  })
  .key("id");
