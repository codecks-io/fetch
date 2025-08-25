
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import { type AccountId } from "./Account";
import { type UserId } from "./User";
import { type DeckId } from "./Deck";


export const accountUserSettingDesc = makeModel({
  name: "accountUserSetting",
  fields: {
    wantsWeeklyDigestMail: f.bool({}),
    timelineScaleTypeOverwrite: f.string({}),
    startWeekdayOverwrite: f.string({}),
    accountId: f.belongsTo().type<AccountId>(),
    userId: f.belongsTo().type<UserId>(),
    inboxDeckId: f.belongsTo({}).type<DeckId>(),
  },
  relations: {
    account: relation("account", { type: "belongsTo", fk: "accountId" }),
    user: relation("user", { type: "belongsTo", fk: "userId" }),
    inboxDeck: relation("deck", { type: "belongsTo", fk: "inboxDeckId" }),
  },
  keys: ["accountId", "userId"]
})