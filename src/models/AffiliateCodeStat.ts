import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import {type AffiliateCodeId} from "./AffiliateCode";

export const affiliateCodeStatDesc = makeModel({
  name: "affiliateCodeStat",
  fields: {
    month: f.int({}),
    year: f.int({}),
    visits: f.int({}),
    newVisitors: f.int({}),
    signups: f.int({}),
    revenue: f.int({}),
    affiliateCodeId: f.belongsTo({}).type<AffiliateCodeId>(),
  },
  relations: {
    affiliateCode: relation("affiliateCode", {type: "belongsTo", fk: "affiliateCodeId"}),
  },
  keys: ["affiliateCodeId", "month"],
});
