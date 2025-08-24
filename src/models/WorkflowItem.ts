
import { makeModel, belongsTo, hasMany } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { deckDesc } from "./Deck";
import { userDesc } from "./User";
import { workflowItemHistoryDesc } from "./WorkflowItemHistory";

export type WorkflowItemId = Nominal<string, "workflowItem">;
export const workflowItemDesc = makeModel("workflowItem")
  .fields({
    itemId: f.id<WorkflowItemId>(),
    version: f.string(),
    sortOrder: f.string(),
    sortValue: f.string(),
    priority: f.string({ optional: true }),
    content: f.string(),
    createdAt: f.date(),
    lastUpdatedAt: f.date(),
    tags: f.array<any>(),
    masterTags: f.array<any>(),
    mentionedUsers: f.array<any>(),
    title: f.string(),
    effort: f.int({ optional: true }),
    label: f.string({ optional: true }),
    checkboxStats: f.object<any>(),
    accountSeq: f.int(),
    checkboxInfo: f.array<any>(),
    visibility: f.string(),
    accountId: belongsTo("account", () => accountDesc),
    deckId: belongsTo("deck", () => deckDesc),
    targetDeckId: belongsTo("targetDeck", () => deckDesc, { optional: true }),
    assigneeId: belongsTo("assignee", () => userDesc, { optional: true }),
    creatorId: belongsTo("creator", () => userDesc),
  })
  .hasMany({
    diffs: hasMany(() => workflowItemHistoryDesc),
    inDeps: hasMany(() => workflowItemDesc),
    outDeps: hasMany(() => workflowItemDesc),
  })
  .key("itemId");
