import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {FileId} from "./File";

export type UserId = Nominal<string, "user">;
/**
 * A person, or an integration or API token that acts in an organization. `kind` tells them apart.
 */
export const userDesc = makeModel({
  name: "user",
  fields: {
    /** `null` unless the user entered one. */
    fullName: f.string({optional: true}),
    id: f.id<UserId>(),
    /** `true` for every `kind` other than `human`. */
    isIntegration: f.bool({}),
    /**
     * `integration` is the user an integration like GitHub or Slack acts as, `api_token` the one an
     * organization's API token acts as.
     */
    kind: f.typed({}).type<"human" | "integration" | "api_token" | (string & {})>(),
    /** The username. `""` when none is set. An API token's user carries the token's label. */
    name: f.string({}),
    profileImageId: f.belongsTo({optional: true}).type<FileId>(),
    /**
     * An IANA time zone like `Europe/Berlin`. Only readable on your own user: `null` on everyone
     * else's.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    timezone: f.string({optional: true, stability: "preview"}),
  },
  relations: {
    profileImage: relation("file", {type: "belongsTo", fk: "profileImageId", optional: true}),
  },
  keys: ["id"],
});
