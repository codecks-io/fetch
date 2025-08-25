
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type CardId } from "./Card";
import { type DeckId } from "./Deck";
import { type ProjectId } from "./Project";
import { type MilestoneId } from "./Milestone";
import { type SprintId } from "./Sprint";
import { type UserId } from "./User";

export type ActivityId = Nominal<string, "activity">;
export const activityDesc = makeModel({
  name: "activity",
  fields: {
    id: f.id<ActivityId>(),
    type: f.string({}),
    data: f.object({}),
    isRemovedFromDeckEntry: f.bool({}),
    isRemovedFromMilestoneEntry: f.bool({}),
    isRemovedFromSprintEntry: f.bool({}),
    createdAt: f.date({}),
    cardId: f.belongsTo().type<CardId>(),
    deckId: f.belongsTo().type<DeckId>(),
    projectId: f.belongsTo().type<ProjectId>(),
    milestoneId: f.belongsTo().type<MilestoneId>(),
    sprintId: f.belongsTo().type<SprintId>(),
    changerId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    card: relation("card", { type: "belongsTo", fk: "cardId" }),
    deck: relation("deck", { type: "belongsTo", fk: "deckId" }),
    project: relation("project", { type: "belongsTo", fk: "projectId" }),
    milestone: relation("milestone", { type: "belongsTo", fk: "milestoneId" }),
    sprint: relation("sprint", { type: "belongsTo", fk: "sprintId" }),
    changer: relation("user", { type: "belongsTo", fk: "changerId" }),
  },
  keys: ["id"]
})