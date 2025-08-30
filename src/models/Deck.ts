
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type ProjectId } from "./Project";
import { type AccountId } from "./Account";
import { type MilestoneId } from "./Milestone";
import { type UserId } from "./User";
import { type FileId } from "./File";
import { type ProjectTagId } from "./ProjectTag";

export type DeckId = Nominal<string, "deck">;
export const deckDesc = makeModel({
  name: "deck",
  fields: {
    id: f.id<DeckId>(),
    content: f.string({}),
    description: f.string({}),
    title: f.string({}),
    sortValue: f.string({}),
    preferredOrder: f.string({ optional: true }),
    coverColor: f.string({ optional: true }),
    isDeleted: f.string({}),
    accountSeq: f.int({}),
    spaceId: f.int({ optional: true }),
    defaultCard: f.object({}),
    isOnboardingDeck: f.bool({}),
    handSyncEnabled: f.string({}),
    stickyDefaultProjectTag: f.string({}),
    manualOrderLabels: f.string({}),
    workflowItemOrderLabels: f.string({}),
    createdAt: f.date({}),
    stats: f.object({}),
    hasGuardians: f.string({}),
    allowedCardTypes: f.string({}),
    projectId: f.belongsTo({}).type<ProjectId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
    milestoneId: f.belongsTo({ optional: true }).type<MilestoneId>(),
    creatorId: f.belongsTo({}).type<UserId>(),
    coverFileId: f.belongsTo({ optional: true }).type<FileId>(),
    descriptionCoverFileId: f.belongsTo({ optional: true }).type<FileId>(),
    defaultProjectTagId: f.belongsTo({ optional: true }).type<ProjectTagId>(),
  },
  relations: {
    project: relation("project", { type: "belongsTo", fk: "projectId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    milestone: relation("milestone", { type: "belongsTo", fk: "milestoneId" }),
    creator: relation("user", { type: "belongsTo", fk: "creatorId" }),
    coverFile: relation("file", { type: "belongsTo", fk: "coverFileId" }),
    descriptionCoverFile: relation("file", { type: "belongsTo", fk: "descriptionCoverFileId" }),
    defaultProjectTag: relation("projectTag", { type: "belongsTo", fk: "defaultProjectTagId" }),
    cards: relation("card", { type: "hasMany" }),
    workflowItems: relation("workflowItem", { type: "hasMany" }),
    cardOrderInDecks: relation("cardOrderInDeck", { type: "hasMany" }),
    activities: relation("activity", { type: "hasMany" }),
    guardians: relation("deckGuardian", { type: "hasMany" }),
  },
  keys: ["id"]
})