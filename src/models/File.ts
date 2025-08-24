
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { userDesc } from "./User";

export type FileId = Nominal<string, "file">;
export const fileDesc = makeModel("file")
  .fields({
    id: f.id<FileId>(),
    name: f.string(),
    url: f.string(),
    size: f.string(),
    isDeleted: f.string(),
    meta: f.object<any>(),
    createdAt: f.date(),
    deletedAt: f.date(),
    selfHosted: f.string(),
    accountId: belongsTo("account", () => accountDesc),
    uploaderId: belongsTo("uploader", () => userDesc),
    deletedById: belongsTo("deletedBy", () => userDesc),
  })
  .hasMany({
    
  })
  .key("id");
