import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {SprintId} from "./Sprint";

/** @experimental `preview` in the Codecks API: may change in any release. */
export const sprintProgressDesc = makeModel({
  name: "sprintProgress",
  stability: "preview",
  fields: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    date: f.string({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    progress: f.typed({stability: "preview"}).type<unknown>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    sprintId: f.belongsTo({stability: "preview"}).type<SprintId>(),
  },
  relations: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    sprint: relation("sprint", {type: "belongsTo", fk: "sprintId", stability: "preview"}),
  },
  keys: ["sprintId", "date"],
});
