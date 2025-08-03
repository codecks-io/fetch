import {
  belongsTo,
  hasMany,
  hasOne,
  idField,
  makeModel,
  makeRoot,
} from "./_desc";
import type { Nominal } from "./_type-helpers";

export type AccountId = Nominal<string, "Account">;
export const accountDesc = makeModel("Account")
  .fields({
    id: idField<AccountId>(),
    name: "string",
    subdomain: "string",
    parentId: belongsTo("parent", () => accountDesc),
    creatorId: belongsTo("creator", () => userDesc, { optional: true }),
  })
  .hasMany({
    subAccounts: hasMany(() => accountDesc),
    members: hasMany(() => userDesc),
  })
  .key("id");

export type UserId = Nominal<string, "User">;
export const userDesc = makeModel("User")
  .fields({
    id: idField<UserId>(),
    name: "string",
    email: "string",
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    friends: hasMany(() => userDesc),
    accounts: hasMany(() => accountDesc),
    bestFriend: hasOne(() => userDesc),
  })
  .key("id");

export const rootDesc = makeRoot("_root", {
  account: hasOne(() => accountDesc, { force: true }),
  loggedInUser: hasOne(() => userDesc),
  allAcounts: hasMany(() => accountDesc),
});
