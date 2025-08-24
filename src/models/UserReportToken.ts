
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { userReportSettingDesc } from "./UserReportSetting";

export type UserReportTokenId = Nominal<string, "userReportToken">;
export const userReportTokenDesc = makeModel("userReportToken")
  .fields({
    token: f.id<UserReportTokenId>(),
    label: f.string(),
    reportCount: f.int(),
    createdAt: f.date(),
    enabled: f.string(),
    userReportSettingId: belongsTo("userReportSetting", () => userReportSettingDesc),
  })
  .hasMany({
    
  })
  .key("token");
