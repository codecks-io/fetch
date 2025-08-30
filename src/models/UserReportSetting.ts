
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type AccountId } from "./Account";

export type UserReportSettingId = Nominal<string, "userReportSetting">;
export const userReportSettingDesc = makeModel({
  name: "userReportSetting",
  fields: {
    id: f.id<UserReportSettingId>(),
    name: f.string({}),
    fileSizeBytesLimit: f.bigint({}),
    createdAt: f.date({}),
    deckMapping: f.object({}),
    prioMapping: f.object({}),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    reportTokens: relation("userReportToken", { type: "hasMany" }),
  },
  keys: ["id"]
})