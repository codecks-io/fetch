import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import {type AccountId} from "./Account";

export const stripeAccountSyncDesc = makeModel({
  name: "stripeAccountSync",
  fields: {
    status: f.string({}),
    euVatIdData: f.object({}),
    vatCountryCode: f.string({}),
    vatTaxPercentage: f.int({}),
    centsPerSeat: f.int({}),
    billingCycleStart: f.date({}),
    billingCycleEnd: f.date({}),
    grossActualBalance: f.int({}),
    grossBonusBalance: f.int({}),
    netGiftBalance: f.int({}),
    paymentMethod: f.object({}),
    hasBeenCancelledAt: f.date({}),
    planType: f.string({}),
    planName: f.string({}),
    pendingPlanType: f.string({}),
    repeatingCoupon: f.object({}),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
  },
  keys: ["accountId"],
});
