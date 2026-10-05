import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {MilestoneId} from "./Milestone";

/**
 * The state of a milestone's cards on a day (UTC). A row is only written on days when the numbers
 * change, so a day without a row has the numbers of the row before it.
 * @experimental `preview` in the Codecks API: may change in any release.
 */
export const milestoneProgressDesc = makeModel({
  name: "milestoneProgress",
  stability: "preview",
  fields: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    date: f.string({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    milestoneId: f.belongsTo({stability: "preview"}).type<MilestoneId>(),
    /**
     * Counts the cards in decks of active projects by their `derivedStatus`, with all done states
     * counted as `done`. `cards` and `effort` have the card count and the effort sum for each state
     * (`done`, `started`, `review`, `blocked`, `snoozing`, `assigned`, `unassigned`, `hero`),
     * `stats` has `[count, effort sum, cards without effort]` for each state and `noEffortCards`
     * counts the cards without effort. States without cards are left out.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    progress: f.typed({stability: "preview"}).type<unknown>(),
  },
  relations: {
    /** @experimental `preview` in the Codecks API: may change in any release. */
    milestone: relation("milestone", {type: "belongsTo", fk: "milestoneId", stability: "preview"}),
  },
  keys: ["milestoneId", "date"],
});
