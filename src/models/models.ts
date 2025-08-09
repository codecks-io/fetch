import {
  belongsTo,
  hasMany,
  hasOne,
  idField,
  makeModel,
  makeRoot,
  type StrictAnyDesc,
} from "./_desc";
import type { Nominal } from "./_type-helpers";

export type AccountId = Nominal<string, "account">;
export const accountDesc = makeModel("account")
  .fields({
    id: idField<AccountId>(),
    name: { type: "string" },
    subdomain: { type: "string" },
    createdAt: { type: "date" },
    disabledBy: belongsTo("disabledByUser", () => userDesc, { optional: true }),
  })
  .hasMany({
    roles: hasMany(() => accountRoleDesc),
  })
  .key("id");

export type UserId = Nominal<string, "user">;
export const userDesc = makeModel("user")
  .fields({
    id: idField<UserId>(),
    name: { type: "string" },
    fullName: { type: "string" },
    createdAt: { type: "date" },
  })
  .hasMany({
    accountRoles: hasMany(() => accountRoleDesc),
  })
  .key("id");

export const rootDesc = makeRoot("_root", {
  account: hasOne(() => accountDesc, { force: true }),
  loggedInUser: hasOne(() => userDesc),
});

export const accountRoleDesc = makeModel("accountRole")
  .fields({
    role: { type: "string" },
    createdAt: { type: "date" },
    lastChangedAt: { type: "date" },
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => userDesc),
  })
  .hasMany({})
  .compoundKey("accountId", "userId");

const makeMap = <T extends StrictAnyDesc>(
  models: T[],
): Record<T["name"], StrictAnyDesc> => {
  return Object.fromEntries(models.map((m) => [m.name, m])) as Record<
    T["name"],
    StrictAnyDesc
  >;
};

export const modelMap = makeMap([
  userDesc,
  accountDesc,
  accountRoleDesc,
  rootDesc,
]);
