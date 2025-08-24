
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { userDesc } from "./User";


export const userDismissedHintDesc = makeModel("userDismissedHint")
  .fields({
    hintKey: f.string(),
    createdAt: f.date(),
    returnAt: f.date(),
    userId: belongsTo("user", () => userDesc),
  })
  .hasMany({
    
  })
  .compoundKey("userId", "hintKey");
