
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { userDesc, userId } from "./User";


export const userOnboardingDesc = makeModel("userOnboarding")
  .fields({
    userId: f.id<userId>(),
    steps: f.object<any>(),
    userId: belongsTo("user", () => userDesc),
  })
  .hasMany({
    
  })
  .key("userId");
