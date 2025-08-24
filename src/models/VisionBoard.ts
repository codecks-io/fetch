
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { cardDesc } from "./Card";
import { accountDesc } from "./Account";
import { userDesc } from "./User";

export type VisionBoardId = Nominal<string, "visionBoard">;
export const visionBoardDesc = makeModel("visionBoard")
  .fields({
    id: f.id<VisionBoardId>(),
    accountSeq: f.int(),
    createdAt: f.date(),
    isDeleted: f.bool(),
    cardId: belongsTo("card", () => cardDesc),
    accountId: belongsTo("account", () => accountDesc),
    creatorId: belongsTo("creator", () => userDesc),
  })
  .hasMany({
    
  })
  .key("id");
