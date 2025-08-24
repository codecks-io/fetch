
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { userDesc } from "./User";
import { cardDesc } from "./Card";

export type QueueEntryId = Nominal<string, "queueEntry">;
export const queueEntryDesc = makeModel("queueEntry")
  .fields({
    id: f.id<QueueEntryId>(),
    sortIndex: f.int(),
    cardDoneAt: f.date(),
    createdAt: f.date(),
    accountId: belongsTo("account", () => accountDesc),
    userId: belongsTo("user", () => userDesc),
    cardId: belongsTo("card", () => cardDesc),
  })
  .hasMany({
    
  })
  .key("id");
