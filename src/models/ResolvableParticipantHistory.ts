
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type ResolvableId } from "./Resolvable";
import { type UserId } from "./User";


export const resolvableParticipantHistoryDesc = makeModel({
  name: "resolvableParticipantHistory",
  fields: {
    firstJoinedAt: f.string({}),
    done: f.string({}),
    status: f.string({}),
    lastChangedAt: f.date({}),
    version: f.int({}),
    reaction: f.string({}),
    resolvableId: f.belongsTo({}).type<ResolvableId>(),
    userId: f.belongsTo({}).type<UserId>(),
    addedById: f.belongsTo({}).type<UserId>(),
  },
  relations: {
    resolvable: relation("resolvable", { type: "belongsTo", fk: "resolvableId" }),
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    addedBy: relation("user", { type: "belongsTo", fk: "addedById" }),
  },
  keys: ["participantId", "resolvableId", "version"]
})