
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type UserId } from "./User";

export type UserOnboardingId = Nominal<string, "userOnboarding">;
export const userOnboardingDesc = makeModel({
  name: "userOnboarding",
  fields: {
    userId: f.id<UserOnboardingId>(),
    steps: f.object({}),
    userId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    user: relation("user", { type: "belongsTo", fk: "userId" }),
  },
  keys: ["userId"]
})