
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type UserId } from "./User";


export const userOnboardingDesc = makeModel({
  name: "userOnboarding",
  fields: {
    steps: f.object({}),
    userId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    user: relation("user", { type: "belongsTo", fk: "userId" }),
  },
  keys: ["userId"]
})