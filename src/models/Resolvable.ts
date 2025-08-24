
import { makeModel, belongsTo, hasMany } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { cardDesc } from "./Card";
import { accountDesc } from "./Account";
import { userDesc } from "./User";
import { resolvableParticipantDesc } from "./ResolvableParticipant";
import { resolvableParticipantHistoryDesc } from "./ResolvableParticipantHistory";
import { resolvableEntryDesc } from "./ResolvableEntry";

export type ResolvableId = Nominal<string, "resolvable">;
export const resolvableDesc = makeModel("resolvable")
  .fields({
    id: f.id<ResolvableId>(),
    context: f.string(),
    contextAsPrio: f.int(),
    isClosed: f.bool(),
    closedAt: f.date({ optional: true }),
    createdAt: f.date(),
    isPublic: f.bool(),
    cardId: belongsTo("card", () => cardDesc),
    accountId: belongsTo("account", () => accountDesc),
    creatorId: belongsTo("creator", () => userDesc),
    closedById: belongsTo("closedBy", () => userDesc, { optional: true }),
  })
  .hasMany({
    participants: hasMany(() => resolvableParticipantDesc),
    participantHistories: hasMany(() => resolvableParticipantHistoryDesc),
    entries: hasMany(() => resolvableEntryDesc),
  })
  .key("id");
