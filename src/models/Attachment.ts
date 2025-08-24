
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { fileDesc } from "./File";
import { cardDesc } from "./Card";
import { accountDesc } from "./Account";
import { userDesc } from "./User";

export type AttachmentId = Nominal<string, "attachment">;
export const attachmentDesc = makeModel("attachment")
  .fields({
    id: f.id<AttachmentId>(),
    content: f.string(),
    title: f.string(),
    createdAt: f.date(),
    fileId: belongsTo("file", () => fileDesc),
    cardId: belongsTo("card", () => cardDesc),
    accountId: belongsTo("account", () => accountDesc),
    creatorId: belongsTo("creator", () => userDesc),
  })
  .hasMany({
    
  })
  .key("id");
