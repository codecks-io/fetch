
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type AccountId } from "./Account";
import { type AppId } from "./App";
import { type UserId } from "./User";

export type AppInstallationId = Nominal<string, "appInstallation">;
export const appInstallationDesc = makeModel({
  name: "appInstallation",
  fields: {
    id: f.id<AppInstallationId>(),
    createdAt: f.date({}),
    accountId: f.belongsTo({}).type<AccountId>(),
    appId: f.belongsTo({}).type<AppId>(),
    installerId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    app: relation("app", { type: "belongsTo", fk: "appId" }),
    installer: relation("user", { type: "belongsTo", fk: "installerId" }),
  },
  keys: ["id"]
})