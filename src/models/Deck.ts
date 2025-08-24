
import { makeModel, belongsTo, hasMany } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { projectDesc } from "./Project";
import { accountDesc } from "./Account";
import { milestoneDesc } from "./Milestone";
import { userDesc } from "./User";
import { fileDesc } from "./File";
import { projectTagDesc } from "./ProjectTag";
import { cardDesc } from "./Card";
import { workflowItemDesc } from "./WorkflowItem";
import { cardOrderInDeckDesc } from "./CardOrderInDeck";
import { activityDesc } from "./Activity";
import { deckGuardianDesc } from "./DeckGuardian";

export type DeckId = Nominal<string, "deck">;
export const deckDesc = makeModel("deck")
  .fields({
    id: f.id<DeckId>(),
    content: f.string(),
    description: f.string(),
    title: f.string(),
    sortValue: f.string(),
    preferredOrder: f.string({ optional: true }),
    coverColor: f.string({ optional: true }),
    isDeleted: f.string(),
    accountSeq: f.int(),
    spaceId: f.int({ optional: true }),
    defaultCard: f.object<any>(),
    isOnboardingDeck: f.bool(),
    handSyncEnabled: f.string(),
    stickyDefaultProjectTag: f.string(),
    manualOrderLabels: f.string(),
    workflowItemOrderLabels: f.string(),
    createdAt: f.date(),
    stats: f.object<any>(),
    hasGuardians: f.string(),
    allowedCardTypes: f.string(),
    projectId: belongsTo("project", () => projectDesc),
    accountId: belongsTo("account", () => accountDesc),
    milestoneId: belongsTo("milestone", () => milestoneDesc, { optional: true }),
    creatorId: belongsTo("creator", () => userDesc),
    coverFileId: belongsTo("coverFile", () => fileDesc, { optional: true }),
    descriptionCoverFileId: belongsTo("descriptionCoverFile", () => fileDesc, { optional: true }),
    defaultProjectTagId: belongsTo("defaultProjectTag", () => projectTagDesc, { optional: true }),
  })
  .hasMany({
    cards: hasMany(() => cardDesc),
    workflowItems: hasMany(() => workflowItemDesc),
    cardOrderInDecks: hasMany(() => cardOrderInDeckDesc),
    activities: hasMany(() => activityDesc),
    guardians: hasMany(() => deckGuardianDesc),
  })
  .key("id");
