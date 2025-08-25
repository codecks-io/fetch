
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type UserReportSettingId } from "./UserReportSetting";

export type UserReportTokenId = Nominal<string, "userReportToken">;
export const userReportTokenDesc = makeModel({
  name: "userReportToken",
  fields: {
    token: f.id<UserReportTokenId>(),
    label: f.string({}),
    reportCount: f.int({}),
    createdAt: f.date({}),
    enabled: f.string({}),
    userReportSettingId: f.belongsTo({}).type<UserReportSettingId>(),
  },
  relations: {
    userReportSetting: relation("userReportSetting", { type: "belongsTo", fk: "userReportSettingId" }),
  },
  keys: ["token"]
})