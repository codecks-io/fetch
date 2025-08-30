
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type FileId } from "./File";
import { type CardId } from "./Card";
import { type AccountId } from "./Account";
import { type UserId } from "./User";

export type AttachmentId = Nominal<string, "attachment">;
export const attachmentDesc = makeModel({
  name: "attachment",
  fields: {
    id: f.id<AttachmentId>(),
    content: f.string({}),
    title: f.string({}),
    createdAt: f.date({}),
    fileId: f.belongsTo({}).type<FileId>(),
    cardId: f.belongsTo({}).type<CardId>(),
    accountId: f.belongsTo({}).type<AccountId>(),
    creatorId: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    file: relation("file", { type: "belongsTo", fk: "fileId" }),
    card: relation("card", { type: "belongsTo", fk: "cardId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    creator: relation("user", { type: "belongsTo", fk: "creatorId" }),
  },
  keys: ["id"]
})