import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {AccountId} from "./Account";
import type {UserId} from "./User";

export type FileId = Nominal<string, "file">;
/** An uploaded file, like a card attachment or a cover image. */
export const fileDesc = makeModel({
  name: "file",
  fields: {
    accountId: f.belongsTo({optional: true}).type<AccountId>(),
    createdAt: f.date({}),
    id: f.id<FileId>(),
    name: f.string({}),
    /** In bytes. `0` once the file is deleted. */
    size: f.int({}),
    uploaderId: f.belongsTo({optional: true}).type<UserId>(),
    /** Where to download the file. `""` once the file is deleted. */
    url: f.string({}),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId", optional: true}),
    uploader: relation("user", {type: "belongsTo", fk: "uploaderId", optional: true}),
  },
  keys: ["id"],
});
