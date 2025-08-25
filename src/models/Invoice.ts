
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type AccountId } from "./Account";

export type InvoiceId = Nominal<string, "invoice">;
export const invoiceDesc = makeModel({
  name: "invoice",
  fields: {
    id: f.id<InvoiceId>(),
    invoiceNumber: f.string({}),
    url: f.string({}),
    createdAt: f.date({}),
    total: f.int({}),
    subtotal: f.int({}),
    charged: f.int({}),
    chargeData: f.object({}),
    accountId: f.belongsTo().type<AccountId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
  },
  keys: ["id"]
})