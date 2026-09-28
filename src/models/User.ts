import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {FileId} from "./File";

export type UserId = Nominal<string, "user">;
export const userDesc = makeModel({
  name: "user",
  fields: {
    fullName: f.string({optional: true}),
    id: f.id<UserId>(),
    isIntegration: f.bool({}),
    kind: f.typed({}).type<"human" | "integration" | "api_token" | (string & {})>(),
    name: f.string({}),
    profileImageId: f.belongsTo({optional: true}).type<FileId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    timezone: f.string({optional: true, stability: "preview"}),
  },
  relations: {
    profileImage: relation("file", {type: "belongsTo", fk: "profileImageId", optional: true}),
  },
  keys: ["id"],
});
