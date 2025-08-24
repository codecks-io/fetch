
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";

export type InvoiceId = Nominal<string, "invoice">;
export const invoiceDesc = makeModel("invoice")
  .fields({
    id: f.id<InvoiceId>(),
    invoiceNumber: f.string(),
    url: f.string(),
    createdAt: f.date(),
    total: f.int(),
    subtotal: f.int(),
    charged: f.int(),
    chargeData: f.object<any>(),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .key("id");
