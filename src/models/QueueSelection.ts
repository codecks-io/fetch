
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { userDesc } from "./User";
import { accountDesc } from "./Account";

export type QueueSelectionId = Nominal<string, "queueSelection">;
export const queueSelectionDesc = makeModel("queueSelection")
  .fields({
    id: f.id<QueueSelectionId>(),
    sortIndex: f.int(),
    userId: belongsTo("user", () => userDesc),
    accountId: belongsTo("account", () => accountDesc),
    queueUserId: belongsTo("queueUser", () => userDesc),
  })
  .hasMany({
    
  })
  .key("id");
