import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import {type AccountId} from "./Account";
import {type UserId} from "./User";

export type SavedSearchId = Nominal<string, "savedSearch">;
export const savedSearchDesc = makeModel({
  name: "savedSearch",
  fields: {
    id: f.id<SavedSearchId>(),
    tokens: f.array({}),
    forceOr: f.bool({}),
    accountId: f.belongsTo({}).type<AccountId>(),
    ownerId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    owner: relation("user", {type: "belongsTo", fk: "ownerId"}),
  },
  keys: ["id"],
});
