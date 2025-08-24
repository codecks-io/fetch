
import { makeModel, belongsTo, hasMany } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { resolvableDesc } from "./Resolvable";
import { cardDesc } from "./Card";
import { userDesc } from "./User";
import { resolvableEntryReactionDesc } from "./ResolvableEntryReaction";
import { resolvableEntryHistoryDesc } from "./ResolvableEntryHistory";

export type ResolvableEntryId = Nominal<string, "resolvableEntry">;
export const resolvableEntryDesc = makeModel("resolvableEntry")
  .fields({
    entryId: f.id<ResolvableEntryId>(),
    content: f.string(),
    lastChangedAt: f.date(),
    createdAt: f.date(),
    version: f.int(),
    meta: f.object<any>(),
    resolvableId: belongsTo("resolvable", () => resolvableDesc),
    cardId: belongsTo("card", () => cardDesc),
    authorId: belongsTo("author", () => userDesc),
  })
  .hasMany({
    reactions: hasMany(() => resolvableEntryReactionDesc),
    histories: hasMany(() => resolvableEntryHistoryDesc),
  })
  .key("entryId");
