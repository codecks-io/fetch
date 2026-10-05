import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {AccountId} from "./Account";
import type {FileId} from "./File";

export type ProjectId = Nominal<string, "project">;
/** Groups decks. A card belongs to the project of its deck. */
export const projectDesc = makeModel({
  name: "project",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    coverFileId: f.belongsTo({optional: true}).type<FileId>(),
    createdAt: f.date({}),
    id: f.id<ProjectId>(),
    name: f.string({}),
    /**
     * The spaces that group the project's decks. Removing a space moves its decks into the first
     * remaining one.
     * @experimental `preview` in the Codecks API: may change in any release.
     */
    spaces: f.typed({stability: "preview"}).type<unknown>(),
    /** Setting `archived` or `deleted` closes all open comment threads on the project's cards. */
    visibility: f.typed({}).type<"default" | "archived" | "deleted" | (string & {})>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    coverFile: relation("file", {type: "belongsTo", fk: "coverFileId", optional: true}),
    decks: relation("deck", {type: "hasMany"}),
    /** Links to the milestones this project can use. */
    milestoneProjects: relation("milestoneProject", {type: "hasMany"}),
    /** Links to the run configs this project can use. */
    sprintProjects: relation("sprintProject", {type: "hasMany"}),
    /**
     * The project's tag list. A card in the project with one of these tags lists it in
     * `masterTags`.
     */
    tags: relation("projectTag", {type: "hasMany"}),
  },
  keys: ["id"],
});
