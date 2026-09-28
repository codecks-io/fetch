import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {AccountId} from "./Account";
import type {ResolvableId} from "./Resolvable";
import type {ResolvableEntryId} from "./ResolvableEntry";
import type {UserId} from "./User";

export type ResolvableEntryReactionId = Nominal<string, "resolvableEntryReaction">;
/** @experimental `preview` in the Codecks API: may change in any release. */
export const resolvableEntryReactionDesc = makeModel({
  name: "resolvableEntryReaction",
  stability: "preview",
  fields: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    accountId: f.belongsTo({stability: "preview"}).type<AccountId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    createdAt: f.date({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    entryId: f.belongsTo({stability: "preview"}).type<ResolvableEntryId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    id: f.id<ResolvableEntryReactionId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    resolvableId: f.belongsTo({stability: "preview"}).type<ResolvableId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    userId: f.belongsTo({stability: "preview"}).type<UserId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    value: f.typed({stability: "preview"}).type<{type: "emoji" | (string & {}); value: string}>(),
  },
  relations: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    account: relation("account", {type: "belongsTo", fk: "accountId", stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    resolvable: relation("resolvable", {
      type: "belongsTo",
      fk: "resolvableId",
      stability: "preview",
    }),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    resolvableEntry: relation("resolvableEntry", {
      type: "belongsTo",
      fk: "entryId",
      stability: "preview",
    }),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    user: relation("user", {type: "belongsTo", fk: "userId", stability: "preview"}),
  },
  keys: ["id"],
});
