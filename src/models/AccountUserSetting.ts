
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { accountDesc } from "./Account";
import { userDesc } from "./User";
import { deckDesc } from "./Deck";


export const accountUserSettingDesc = makeModel("accountUserSetting")
  .fields({
    wantsWeeklyDigestMail: f.bool(),
    timelineScaleTypeOverwrite: f.string(),
    startWeekdayOverwrite: f.string(),
    accountId: belongsTo("account", () => accountDesc),
    userId: belongsTo("user", () => userDesc),
    inboxDeckId: belongsTo("inboxDeck", () => deckDesc),
  })
  .hasMany({
    
  })
  .compoundKey("accountId", "userId");
