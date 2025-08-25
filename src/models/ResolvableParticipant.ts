
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type ResolvableId } from "./Resolvable";
import { type AccountId } from "./Account";
import { type UserId } from "./User";


export const resolvableParticipantDesc = makeModel({
  name: "resolvableParticipant",
  fields: {
    firstJoinedAt: f.date({}),
    lastChangedAt: f.date({}),
    done: f.bool({}),
    status: f.string({}),
    discordUserId: f.string({}),
    resolvableIsClosed: f.bool({}),
    resolvableId: f.belongsTo().type<ResolvableId>(),
    accountId: f.belongsTo().type<AccountId>(),
    userId: f.belongsTo({}).type<UserId>(),
    addedById: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    resolvable: relation("resolvable", { type: "belongsTo", fk: "resolvableId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    addedBy: relation("user", { type: "belongsTo", fk: "addedById" }),
  },
  keys: ["participantId", "resolvableId"]
})