
import { makeModel } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";

export type AccountOnboardingStepId = Nominal<string, "accountOnboardingStep">;
export const accountOnboardingStepDesc = makeModel("accountOnboardingStep")
  .fields({
    key: f.id<AccountOnboardingStepId>(),
    title: f.string(),
    description: f.string(),
    chapter: f.string(),
    sortValue: f.string(),
    variants: f.array<any>(),
    xp: f.int(),
    milestone: f.string(),
    
  })
  .hasMany({
    
  })
  .key("key");
