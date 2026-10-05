import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import type {AccountId} from "./Account";
import type {CardId} from "./Card";
import type {FileId} from "./File";
import type {UserId} from "./User";

export type AttachmentId = Nominal<string, "attachment">;
/** A file attached to a card. */
export const attachmentDesc = makeModel({
  name: "attachment",
  fields: {
    accountId: f.belongsTo({}).type<AccountId>(),
    cardId: f.belongsTo({}).type<CardId>(),
    /** The attachment's label as markdown. It starts as the file name. */
    content: f.string({}),
    createdAt: f.date({}),
    creatorId: f.belongsTo({optional: true}).type<UserId>(),
    fileId: f.belongsTo({}).type<FileId>(),
    id: f.id<AttachmentId>(),
    /** The first line of `content` as plain text, cut to 80 characters. */
    title: f.string({}),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    card: relation("card", {type: "belongsTo", fk: "cardId"}),
    creator: relation("user", {type: "belongsTo", fk: "creatorId", optional: true}),
    file: relation("file", {type: "belongsTo", fk: "fileId"}),
  },
  keys: ["id"],
});
