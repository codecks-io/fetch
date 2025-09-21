import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import {type UserId} from "./User";

export type UserEmailId = Nominal<string, "userEmail">;
export const userEmailDesc = makeModel({
  name: "userEmail",
  fields: {
    id: f.id<UserEmailId>(),
    email: f.string({}),
    createdAt: f.date({}),
    isPrimary: f.bool({}),
    isVerified: f.bool({}),
    userId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    user: relation("user", {type: "belongsTo", fk: "userId"}),
  },
  keys: ["id"],
});
