
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { resolvableDesc } from "./Resolvable";
import { userDesc } from "./User";


export const resolvableParticipantHistoryDesc = makeModel("resolvableParticipantHistory")
  .fields({
    firstJoinedAt: f.string(),
    done: f.string(),
    status: f.string(),
    lastChangedAt: f.date(),
    version: f.int(),
    reaction: f.string(),
    resolvableId: belongsTo("resolvable", () => resolvableDesc),
    userId: belongsTo("user", () => userDesc),
    addedById: belongsTo("addedBy", () => userDesc),
  })
  .hasMany({
    
  })
  .compoundKey("participantId", "resolvableId", "version");
