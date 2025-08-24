
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { resolvableDesc } from "./Resolvable";
import { accountDesc } from "./Account";
import { userDesc } from "./User";


export const resolvableParticipantDesc = makeModel("resolvableParticipant")
  .fields({
    firstJoinedAt: f.date(),
    lastChangedAt: f.date(),
    done: f.bool(),
    status: f.string(),
    discordUserId: f.string(),
    resolvableIsClosed: f.bool(),
    resolvableId: belongsTo("resolvable", () => resolvableDesc),
    accountId: belongsTo("account", () => accountDesc),
    userId: belongsTo("user", () => userDesc),
    addedById: belongsTo("addedBy", () => userDesc),
  })
  .hasMany({
    
  })
  .compoundKey("participantId", "resolvableId");
