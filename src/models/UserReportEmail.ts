import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import {type UserReportSettingId} from "./UserReportSetting";
import {type AccountId} from "./Account";

export type UserReportEmailId = Nominal<string, "userReportEmail">;
export const userReportEmailDesc = makeModel({
  name: "userReportEmail",
  fields: {
    id: f.id<UserReportEmailId>(),
    email: f.string({}),
    createdAt: f.date({}),
    enabled: f.string({}),
    userReportSettingId: f.belongsTo({}).type<UserReportSettingId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    userReportSetting: relation("userReportSetting", {
      type: "belongsTo",
      fk: "userReportSettingId",
    }),
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
  },
  keys: ["id"],
});
