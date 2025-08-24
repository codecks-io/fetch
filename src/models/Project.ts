
import { makeModel, belongsTo, hasMany, hasOne } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { fileDesc } from "./File";
import { deckDesc } from "./Deck";
import { milestoneProjectDesc } from "./MilestoneProject";
import { sprintProjectDesc } from "./SprintProject";
import { publicProjectVisitDesc } from "./PublicProjectVisit";
import { dailyPublicProjectMembershipDesc } from "./DailyPublicProjectMembership";
import { publicProjectMembershipDesc } from "./PublicProjectMembership";
import { cardUpvoteDesc } from "./CardUpvote";
import { projectTagDesc } from "./ProjectTag";
import { activityDesc } from "./Activity";
import { projectUserDesc } from "./ProjectUser";
import { userProjectAccessDesc } from "./UserProjectAccess";
import { publicProjectInfoDesc } from "./PublicProjectInfo";

export type ProjectId = Nominal<string, "project">;
export const projectDesc = makeModel("project")
  .fields({
    id: f.id<ProjectId>(),
    name: f.string(),
    visibility: f.string(),
    defaultUserAccess: f.string(),
    createdAt: f.date(),
    accountSeq: f.int(),
    allowUpvotes: f.string(),
    isPublic: f.string(),
    commentsArePublic: f.string(),
    publicRegistryAgreement: f.string({ optional: true }),
    publicLayoutVersion: f.string(),
    publicIsExplicit: f.string(),
    markerColor: f.string({ optional: true }),
    effortIcon: f.string({ optional: true }),
    spaces: f.string(),
    publicPath: f.string({ optional: true }),
    publicMessage: f.string({ optional: true }),
    publicHeading: f.string({ optional: true }),
    publicBackgroundColor: f.string({ optional: true }),
    accountId: belongsTo("account", () => accountDesc),
    coverFileId: belongsTo("coverFile", () => fileDesc, { optional: true }),
    publicBannerFileId: belongsTo("publicBannerFile", () => fileDesc, { optional: true }),
    publicTileFileId: belongsTo("publicTileFile", () => fileDesc, { optional: true }),
    publicBackgroundImageId: belongsTo("publicBackgroundImage", () => fileDesc, { optional: true }),
  })
  .hasMany({
    decks: hasMany(() => deckDesc),
    milestoneProjects: hasMany(() => milestoneProjectDesc),
    sprintProjects: hasMany(() => sprintProjectDesc),
    publicProjectVisits: hasMany(() => publicProjectVisitDesc),
    dailyPublicProjectMembership: hasMany(() => dailyPublicProjectMembershipDesc),
    publicProjectMemberships: hasMany(() => publicProjectMembershipDesc),
    cardUpvotes: hasMany(() => cardUpvoteDesc),
    tags: hasMany(() => projectTagDesc),
    activities: hasMany(() => activityDesc),
    explicitProjectUsers: hasMany(() => projectUserDesc),
    access: hasMany(() => userProjectAccessDesc),
    publicProjectInfo: hasOne(() => publicProjectInfoDesc),
  })
  .key("id");
