
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { cardDesc } from "./Card";
import { accountDesc } from "./Account";

export type VisionBoardQueryId = Nominal<string, "visionBoardQuery">;
export const visionBoardQueryDesc = makeModel("visionBoardQuery")
  .fields({
    id: f.id<VisionBoardQueryId>(),
    query: f.object<any>(),
    lastUsedAt: f.date(),
    isStale: f.bool(),
    type: f.string(),
    payload: f.object<any>(),
    createdAt: f.date(),
    cardId: belongsTo("card", () => cardDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .key("id");
