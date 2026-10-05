import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {MilestoneColor} from "./definitions";
import type {AccountId} from "./Account";
import type {FileId} from "./File";
import type {UserId} from "./User";

export type MilestoneId = Nominal<string, "milestone">;
/**
 * A date that cards are planned towards. It belongs to a list of projects, or with `isGlobal` to
 * all projects of the organization.
 */
export const milestoneDesc = makeModel({
  name: "milestone",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    /**
     * The milestone's number within the organization. The web app uses it in the milestone's URL:
     * `/milestones/<accountSeq>`.
     */
    accountSeq: f.int({}),
    color: f.typed({}).type<MilestoneColor>(),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    coverFileId: f.belongsTo({optional: true, stability: "preview"}).type<FileId>(),
    createdAt: f.date({}),
    creatorId: f.belongsTo({}).type<UserId>(),
    date: f.day({}),
    description: f.string({optional: true}),
    /**
     * Its cards that are not done and have an assignee are added to the assignee's Hand.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    handSyncEnabled: f.bool({stability: "preview"}),
    id: f.id<MilestoneId>(),
    isDeleted: f.bool({}),
    /**
     * The milestone belongs to all projects of the organization, also to projects created later.
     */
    isGlobal: f.bool({}),
    /**
     * The names of the zones the web app groups the cards into when they are ordered by hand, in
     * order. `null` is the zone without a name.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    manualOrderLabels: f.typed({stability: "preview"}).type<(string | null)[]>(),
    name: f.string({}),
    startDate: f.day({optional: true}),
    /**
     * The planned effort per user, keyed by user id. The web app compares it with the effort of the
     * user's cards, where a card without `effort` counts as `account.fallbackEffort`.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    userCapacities: f.typed({stability: "preview"}).type<{[userId: UserId]: number}>(),
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
    milestoneProjects: relation("milestoneProject", {type: "hasMany"}),
    /**
     * The daily progress history.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    progress: relation("milestoneProgress", {type: "hasMany", stability: "preview"}),
  },
  keys: ["id"],
});
