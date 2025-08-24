
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";

export type WizardId = Nominal<string, "wizard">;
export const wizardDesc = makeModel("wizard")
  .fields({
    id: f.id<WizardId>(),
    name: f.string(),
    currentStep: f.string(),
    data: f.object<any>(),
    createdAt: f.date(),
    finishedAt: f.date(),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .key("id");
