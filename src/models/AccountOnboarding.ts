
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type AccountId } from "./Account";


export const accountOnboardingDesc = makeModel({
  name: "accountOnboarding",
  fields: {
    variants: f.array({}),
    steps: f.object({}),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["accountId"]
})