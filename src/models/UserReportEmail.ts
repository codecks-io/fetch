
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { userReportSettingDesc } from "./UserReportSetting";
import { accountDesc } from "./Account";

export type UserReportEmailId = Nominal<string, "userReportEmail">;
export const userReportEmailDesc = makeModel("userReportEmail")
  .fields({
    id: f.id<UserReportEmailId>(),
    email: f.string(),
    createdAt: f.date(),
    enabled: f.string(),
    userReportSettingId: belongsTo("userReportSetting", () => userReportSettingDesc),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    
  })
  .key("id");
