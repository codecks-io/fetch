
import { makeModel, belongsTo, hasMany } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { userDesc } from "./User";
import { affiliateCodeStatDesc } from "./AffiliateCodeStat";

export type AffiliateCodeId = Nominal<string, "affiliateCode">;
export const affiliateCodeDesc = makeModel("affiliateCode")
  .fields({
    id: f.id<AffiliateCodeId>(),
    code: f.string(),
    vanityUrl: f.string(),
    message: f.string(),
    label: f.string(),
    isDisabled: f.string(),
    isDeleted: f.string(),
    validUntil: f.string(),
    remainingRedemptions: f.string(),
    reward: f.object<any>(),
    createdAt: f.date(),
    accountId: belongsTo("account", () => accountDesc),
    creatorId: belongsTo("creator", () => userDesc),
  })
  .hasMany({
    stats: hasMany(() => affiliateCodeStatDesc),
  })
  .key("id");
