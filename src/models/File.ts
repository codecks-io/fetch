import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {AccountId} from "./Account";
import type {UserId} from "./User";

export type FileId = Nominal<string, "file">;
export const fileDesc = makeModel({
  name: "file",
  fields: {
    accountId: f.belongsTo({optional: true}).type<AccountId>(),
    createdAt: f.date({}),
    id: f.id<FileId>(),
    name: f.string({}),
    size: f.int({}),
    uploaderId: f.belongsTo({}).type<UserId>(),
    url: f.string({}),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId", optional: true}),
    uploader: relation("user", {type: "belongsTo", fk: "uploaderId"}),
  },
  keys: ["id"],
});
