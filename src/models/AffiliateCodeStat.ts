
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { affiliateCodeDesc } from "./AffiliateCode";


export const affiliateCodeStatDesc = makeModel("affiliateCodeStat")
  .fields({
    month: f.int(),
    year: f.int(),
    visits: f.int(),
    newVisitors: f.int(),
    signups: f.int(),
    revenue: f.int(),
    affiliateCodeId: belongsTo("affiliateCode", () => affiliateCodeDesc),
  })
  .hasMany({
    
  })
  .compoundKey("affiliateCodeId", "month");
