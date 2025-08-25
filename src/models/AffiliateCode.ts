
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type AccountId } from "./Account";
import { type UserId } from "./User";

export type AffiliateCodeId = Nominal<string, "affiliateCode">;
export const affiliateCodeDesc = makeModel({
  name: "affiliateCode",
  fields: {
    id: f.id<AffiliateCodeId>(),
    code: f.string({}),
    vanityUrl: f.string({}),
    message: f.string({}),
    label: f.string({}),
    isDisabled: f.string({}),
    isDeleted: f.string({}),
    validUntil: f.string({}),
    remainingRedemptions: f.string({}),
    reward: f.object({}),
    createdAt: f.date({}),
    accountId: f.belongsTo().type<AccountId>(),
    creatorId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    creator: relation("user", { type: "belongsTo", fk: "creatorId" }),
    stats: relation("affiliateCodeStat", { type: "hasMany" }),
  },
  keys: ["id"]
})