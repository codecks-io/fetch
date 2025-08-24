
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { cardDesc } from "./Card";
import { deckDesc } from "./Deck";
import { projectDesc } from "./Project";
import { milestoneDesc } from "./Milestone";
import { sprintDesc } from "./Sprint";
import { userDesc } from "./User";

export type ActivityId = Nominal<string, "activity">;
export const activityDesc = makeModel("activity")
  .fields({
    id: f.id<ActivityId>(),
    type: f.string(),
    data: f.object<any>(),
    isRemovedFromDeckEntry: f.bool(),
    isRemovedFromMilestoneEntry: f.bool(),
    isRemovedFromSprintEntry: f.bool(),
    createdAt: f.date(),
    cardId: belongsTo("card", () => cardDesc),
    deckId: belongsTo("deck", () => deckDesc),
    projectId: belongsTo("project", () => projectDesc),
    milestoneId: belongsTo("milestone", () => milestoneDesc),
    sprintId: belongsTo("sprint", () => sprintDesc),
    changerId: belongsTo("changer", () => userDesc),
  })
  .hasMany({
    
  })
  .key("id");
