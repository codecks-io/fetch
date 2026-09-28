import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {SprintConfigId} from "./SprintConfig";

/** @experimental `preview` in the Codecks API: may change in any release. */
export const sprintConfigProgressDesc = makeModel({
  name: "sprintConfigProgress",
  stability: "preview",
  fields: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    date: f.string({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
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
