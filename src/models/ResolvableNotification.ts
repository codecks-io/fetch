
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type UserId } from "./User";
import { type ResolvableId } from "./Resolvable";
import { type AccountId } from "./Account";
import { type ResolvableEntryId } from "./ResolvableEntry";


export const resolvableNotificationDesc = makeModel({
  name: "resolvableNotification",
  fields: {
    isParticipating: f.bool({}),
    isSnoozing: f.bool({}),
    unseenEntryCount: f.int({}),
    unseenAuthors: f.array({}),
    isLastParticipant: f.bool({}),
    lastUpdatedAt: f.date({}),
    snoozeUntil: f.date({ optional: true }),
    remindMeOn: f.date({ optional: true }),
    createdAt: f.date({}),
    userId: f.belongsTo().type<UserId>(),
    resolvableId: f.belongsTo().type<ResolvableId>(),
    accountId: f.belongsTo().type<AccountId>(),
    latestEntryId: f.belongsTo({}).type<ResolvableEntryId>(),
    latestSeenEntryId: f.belongsTo({}).type<ResolvableEntryId>(),
  },
  relations: {
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    resolvable: relation("resolvable", { type: "belongsTo", fk: "resolvableId" }),
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    latestEntry: relation("resolvableEntry", { type: "belongsTo", fk: "latestEntryId" }),
    latestSeenEntry: relation("resolvableEntry", { type: "belongsTo", fk: "latestSeenEntryId" }),
  },
  keys: ["userId", "resolvableId"]
})