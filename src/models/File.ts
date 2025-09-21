import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import {type AccountId} from "./Account";
import {type UserId} from "./User";

export type FileId = Nominal<string, "file">;
export const fileDesc = makeModel({
  name: "file",
  fields: {
    id: f.id<FileId>(),
    name: f.string({}),
    url: f.string({}),
    size: f.string({}),
    isDeleted: f.string({}),
    meta: f.object({}),
    createdAt: f.date({}),
    deletedAt: f.date({}),
    selfHosted: f.string({}),
    accountId: f.belongsTo({}).type<AccountId>(),
    uploaderId: f.belongsTo({}).type<UserId>(),
    deletedById: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    uploader: relation("user", {type: "belongsTo", fk: "uploaderId"}),
    deletedBy: relation("user", {type: "belongsTo", fk: "deletedById"}),
  },
  keys: ["id"],
});
