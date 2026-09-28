import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {DefaultCard} from "./definitions";
import type {AccountId} from "./Account";
import type {FileId} from "./File";
import type {MilestoneId} from "./Milestone";
import type {ProjectId} from "./Project";
import type {ProjectTagId} from "./ProjectTag";
import type {UserId} from "./User";

export type DeckId = Nominal<string, "deck">;
export const deckDesc = makeModel({
  name: "deck",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    accountSeq: f.int({}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    coverColor: f.string({optional: true, stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    coverFileId: f.belongsTo({optional: true, stability: "preview"}).type<FileId>(),
    createdAt: f.date({}),
    creatorId: f.belongsTo({}).type<UserId>(),
    deckType: f.typed({}).type<"task" | "hero" | "doc" | "mixed" | (string & {})>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    defaultCard: f.typed({stability: "preview"}).type<DefaultCard>(),
    defaultProjectTagId: f.belongsTo({optional: true}).type<ProjectTagId>(),
    description: f.string({}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    handSyncEnabled: f.bool({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    hasGuardians: f.bool({stability: "preview"}),
    id: f.id<DeckId>(),
    isDeleted: f.bool({}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    manualOrderLabels: f.typed({stability: "preview"}).type<(string | null)[]>(),
    milestoneId: f.belongsTo({optional: true}).type<MilestoneId>(),
    projectId: f.belongsTo({}).type<ProjectId>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    sortValue: f.string({stability: "preview"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    spaceId: f.int({optional: true, stability: "preview"}),
    title: f.string({}),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    cards: relation("card", {type: "hasMany"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    coverFile: relation("file", {
      type: "belongsTo",
      fk: "coverFileId",
      optional: true,
      stability: "preview",
    }),
    creator: relation("user", {type: "belongsTo", fk: "creatorId"}),
    defaultProjectTag: relation("projectTag", {
      type: "belongsTo",
      fk: "defaultProjectTagId",
      optional: true,
    }),
    milestone: relation("milestone", {type: "belongsTo", fk: "milestoneId", optional: true}),
    project: relation("project", {type: "belongsTo", fk: "projectId"}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    workflowItems: relation("workflowItem", {type: "hasMany", stability: "preview"}),
  },
  keys: ["id"],
});
