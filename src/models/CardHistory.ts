import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {AccountId} from "./Account";
import type {CardId} from "./Card";
import type {UserId} from "./User";

/** @experimental `preview` in the Codecks API: may change in any release. */
export const cardHistoryDesc = makeModel({
  name: "cardHistory",
  stability: "preview",
  fields: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    accountId: f.belongsTo({stability: "preview"}).type<AccountId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    cardId: f.belongsTo({stability: "preview"}).type<CardId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    changerId: f.belongsTo({optional: true, stability: "preview"}).type<UserId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    diff: f.typed({stability: "preview"}).type<{[key: string]: unknown}>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    version: f.int({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    versionCreatedAt: f.date({stability: "preview"}),
  },
  relations: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    account: relation("account", {type: "belongsTo", fk: "accountId", stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    card: relation("card", {type: "belongsTo", fk: "cardId", stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    changer: relation("user", {
      type: "belongsTo",
      fk: "changerId",
      optional: true,
      stability: "preview",
    }),
  },
  keys: ["cardId", "version"],
});
