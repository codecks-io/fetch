import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {SprintConfigId} from "./SprintConfig";

/**
 * The done cards of all runs of a Run Config on a day (UTC). A row is only written on days when the
 * numbers change, so a day without a row has the numbers of the row before it.
 * @experimental `preview` in the Codecks API: may change in any release.
 */
export const sprintConfigProgressDesc = makeModel({
  name: "sprintConfigProgress",
  stability: "preview",
  fields: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    date: f.string({stability: "preview"}),
    /**
     * `stats.done` is `[count, effort sum, cards without effort]` of the done cards in all runs,
     * counting only cards in decks of active projects.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    progress: f.typed({stability: "preview"}).type<unknown>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    sprintConfigId: f.belongsTo({stability: "preview"}).type<SprintConfigId>(),
  },
  relations: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    sprintConfig: relation("sprintConfig", {
      type: "belongsTo",
      fk: "sprintConfigId",
      stability: "preview",
    }),
  },
  keys: ["sprintConfigId", "date"],
});
