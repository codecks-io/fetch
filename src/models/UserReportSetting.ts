
import { makeModel, belongsTo, hasMany } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { userReportTokenDesc } from "./UserReportToken";

export type UserReportSettingId = Nominal<string, "userReportSetting">;
export const userReportSettingDesc = makeModel("userReportSetting")
  .fields({
    id: f.id<UserReportSettingId>(),
    name: f.string(),
    fileSizeBytesLimit: f.bigint(),
    createdAt: f.date(),
    deckMapping: f.object<any>(),
    prioMapping: f.object<any>(),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    reportTokens: hasMany(() => userReportTokenDesc),
  })
  .key("id");
