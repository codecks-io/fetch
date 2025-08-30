
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type AccountId } from "./Account";

export type WizardId = Nominal<string, "wizard">;
export const wizardDesc = makeModel({
  name: "wizard",
  fields: {
    id: f.id<WizardId>(),
    name: f.string({}),
    currentStep: f.string({}),
    data: f.object({}),
    createdAt: f.date({}),
    finishedAt: f.date({}),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["id"]
})