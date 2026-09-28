import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {AccountId} from "./Account";
import type {CardId} from "./Card";
import type {FileId} from "./File";
import type {UserId} from "./User";

export type AttachmentId = Nominal<string, "attachment">;
export const attachmentDesc = makeModel({
  name: "attachment",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    cardId: f.belongsTo({}).type<CardId>(),
    content: f.string({}),
    createdAt: f.date({}),
    creatorId: f.belongsTo({}).type<UserId>(),
    fileId: f.belongsTo({}).type<FileId>(),
    id: f.id<AttachmentId>(),
    title: f.string({}),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    card: relation("card", {type: "belongsTo", fk: "cardId"}),
    creator: relation("user", {type: "belongsTo", fk: "creatorId"}),
    file: relation("file", {type: "belongsTo", fk: "fileId"}),
  },
  keys: ["id"],
});
