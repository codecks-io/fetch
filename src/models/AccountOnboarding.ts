
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { accountDesc, accountId } from "./Account";


export const accountOnboardingDesc = makeModel("accountOnboarding")
  .fields({
    accountId: f.id<accountId>(),
    variants: f.array<any>(),
    steps: f.object<any>(),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .key("accountId");
