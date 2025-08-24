
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { accountDesc, accountId } from "./Account";


export const stripeAccountSyncDesc = makeModel("stripeAccountSync")
  .fields({
    accountId: f.id<accountId>(),
    status: f.string(),
    euVatIdData: f.object<any>(),
    vatCountryCode: f.string(),
    vatTaxPercentage: f.int(),
    centsPerSeat: f.int(),
    billingCycleStart: f.date(),
    billingCycleEnd: f.date(),
    grossActualBalance: f.int(),
    grossBonusBalance: f.int(),
    netGiftBalance: f.int(),
    paymentMethod: f.object<any>(),
    hasBeenCancelledAt: f.date(),
    planType: f.string(),
    planName: f.string(),
    pendingPlanType: f.string(),
    repeatingCoupon: f.object<any>(),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .key("accountId");
