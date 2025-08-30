
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type AccountId } from "./Account";
import { type UserId } from "./User";

export type IntegrationId = Nominal<string, "integration">;
export const integrationDesc = makeModel({
  name: "integration",
  fields: {
    id: f.id<IntegrationId>(),
    type: f.string({}),
    disabled: f.string({}),
    userData: f.object({}),
    createdAt: f.date({}),
    version: f.int({}),
    accountId: f.belongsTo({}).type<AccountId>(),
    userId: f.belongsTo({}).type<UserId>(),
    creatorId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    creator: relation("user", { type: "belongsTo", fk: "creatorId" }),
  },
  keys: ["id"]
})