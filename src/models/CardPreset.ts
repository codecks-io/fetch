
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { userDesc } from "./User";

export type CardPresetId = Nominal<string, "cardPreset">;
export const cardPresetDesc = makeModel("cardPreset")
  .fields({
    id: f.id<CardPresetId>(),
    name: f.string(),
    data: f.object<any>(),
    createdAt: f.date(),
    accountId: belongsTo("account", () => accountDesc),
    creatorId: belongsTo("creator", () => userDesc),
  })
  .hasMany({
    
  })
  .key("id");
