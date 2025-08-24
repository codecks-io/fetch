
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { userDesc } from "./User";
import { resolvableDesc } from "./Resolvable";
import { accountDesc } from "./Account";
import { resolvableEntryDesc } from "./ResolvableEntry";


export const resolvableNotificationDesc = makeModel("resolvableNotification")
  .fields({
    isParticipating: f.bool(),
    isSnoozing: f.bool(),
    unseenEntryCount: f.int(),
    unseenAuthors: f.array<any>(),
    isLastParticipant: f.bool(),
    lastUpdatedAt: f.date(),
    snoozeUntil: f.date({ optional: true }),
    remindMeOn: f.date({ optional: true }),
    createdAt: f.date(),
    userId: belongsTo("user", () => userDesc),
    resolvableId: belongsTo("resolvable", () => resolvableDesc),
    accountId: belongsTo("account", () => accountDesc),
    latestEntryId: belongsTo("latestEntry", () => resolvableEntryDesc),
    latestSeenEntryId: belongsTo("latestSeenEntry", () => resolvableEntryDesc),
  })
  .hasMany({
    
  })
  .compoundKey("userId", "resolvableId");
