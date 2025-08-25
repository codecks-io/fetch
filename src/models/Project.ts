
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type AccountId } from "./Account";
import { type FileId } from "./File";

export type ProjectId = Nominal<string, "project">;
export const projectDesc = makeModel({
  name: "project",
  fields: {
    id: f.id<ProjectId>(),
    name: f.string({}),
    visibility: f.string({}),
    defaultUserAccess: f.string({}),
    createdAt: f.date({}),
    accountSeq: f.int({}),
    allowUpvotes: f.string({}),
    isPublic: f.string({}),
    commentsArePublic: f.string({}),
    publicRegistryAgreement: f.string({ optional: true }),
    publicLayoutVersion: f.string({}),
    publicIsExplicit: f.string({}),
    markerColor: f.string({ optional: true }),
    effortIcon: f.string({ optional: true }),
    spaces: f.string({}),
    publicPath: f.string({ optional: true }),
    publicMessage: f.string({ optional: true }),
    publicHeading: f.string({ optional: true }),
    publicBackgroundColor: f.string({ optional: true }),
    accountId: f.belongsTo().type<AccountId>(),
    coverFileId: f.belongsTo({ optional: true }).type<FileId>(),
    publicBannerFileId: f.belongsTo({ optional: true }).type<FileId>(),
    publicTileFileId: f.belongsTo({ optional: true }).type<FileId>(),
    publicBackgroundImageId: f.belongsTo({ optional: true }).type<FileId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    coverFile: relation("file", { type: "belongsTo", fk: "coverFileId" }),
    publicBannerFile: relation("file", { type: "belongsTo", fk: "publicBannerFileId" }),
    publicTileFile: relation("file", { type: "belongsTo", fk: "publicTileFileId" }),
    publicBackgroundImage: relation("file", { type: "belongsTo", fk: "publicBackgroundImageId" }),
    decks: relation("deck", { type: "hasMany" }),
    milestoneProjects: relation("milestoneProject", { type: "hasMany" }),
    sprintProjects: relation("sprintProject", { type: "hasMany" }),
    publicProjectVisits: relation("publicProjectVisit", { type: "hasMany" }),
    dailyPublicProjectMembership: relation("dailyPublicProjectMembership", { type: "hasMany" }),
    publicProjectMemberships: relation("publicProjectMembership", { type: "hasMany" }),
    cardUpvotes: relation("cardUpvote", { type: "hasMany" }),
    tags: relation("projectTag", { type: "hasMany" }),
    activities: relation("activity", { type: "hasMany" }),
    explicitProjectUsers: relation("projectUser", { type: "hasMany" }),
    access: relation("userProjectAccess", { type: "hasMany" }),
    publicProjectInfo: relation("publicProjectInfo", { type: "hasOne" }),
  },
  keys: ["id"]
})