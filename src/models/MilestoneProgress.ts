import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {MilestoneId} from "./Milestone";

/** @experimental `preview` in the Codecks API: may change in any release. */
export const milestoneProgressDesc = makeModel({
  name: "milestoneProgress",
  stability: "preview",
  fields: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    date: f.string({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    milestoneId: f.belongsTo({stability: "preview"}).type<MilestoneId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    progress: f.typed({stability: "preview"}).type<unknown>(),
  },
  relations: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    milestone: relation("milestone", {type: "belongsTo", fk: "milestoneId", stability: "preview"}),
  },
  keys: ["milestoneId", "date"],
});
