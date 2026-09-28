import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {AccountId} from "./Account";
import type {FileId} from "./File";

export type ProjectId = Nominal<string, "project">;
export const projectDesc = makeModel({
  name: "project",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    coverFileId: f.belongsTo({optional: true}).type<FileId>(),
    createdAt: f.date({}),
    id: f.id<ProjectId>(),
    name: f.string({}),
    /** @experimental `preview` in the Codecks API: may change in any release. */
    spaces: f.typed({stability: "preview"}).type<unknown>(),
    visibility: f.typed({}).type<"default" | "archived" | "deleted" | (string & {})>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    coverFile: relation("file", {type: "belongsTo", fk: "coverFileId", optional: true}),
    decks: relation("deck", {type: "hasMany"}),
    milestoneProjects: relation("milestoneProject", {type: "hasMany"}),
    sprintProjects: relation("sprintProject", {type: "hasMany"}),
    tags: relation("projectTag", {type: "hasMany"}),
  },
  keys: ["id"],
});
