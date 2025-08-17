import { hasOne, makeRoot, type StrictAnyDesc } from "./_desc";
import { accountDesc } from "./Account";
import { accountRoleDesc } from "./AccountRole";
import { userDesc } from "./User";

export const rootDesc = makeRoot("_root", {
  account: hasOne(() => accountDesc, { force: true }),
  loggedInUser: hasOne(() => userDesc),
});

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
