
import { makeModel, hasMany, hasOne } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { releaseDesc } from "./Release";
import { accountOnboardingStepDesc } from "./AccountOnboardingStep";
import { appDesc } from "./App";
import { accountDesc } from "./Account";
import { userDesc } from "./User";
import { cardsStatusHistoryDesc } from "./CardsStatusHistory";
import { cardsEffortHistoryDesc } from "./CardsEffortHistory";
import { cardsFinishedHistoryDesc } from "./CardsFinishedHistory";
import { cardsTimeToFinishedDesc } from "./CardsTimeToFinished";

export type _rootId = Nominal<string, "_root">;
export const _rootDesc = makeModel("_root")
  .fields({
    id: f.id<_rootId>(),
    
  })
  .hasMany({
    releases: hasMany(() => releaseDesc),
    accountOnboardingSteps: hasMany(() => accountOnboardingStepDesc),
    apps: hasMany(() => appDesc),
    account: hasOne(() => accountDesc),
    loggedInUser: hasOne(() => userDesc),
    cardsStatusHistory: hasMany(() => cardsStatusHistoryDesc),
    cardsEffortHistory: hasMany(() => cardsEffortHistoryDesc),
    cardsFinishedHistory: hasMany(() => cardsFinishedHistoryDesc),
    cardsTimeToFinished: hasMany(() => cardsTimeToFinishedDesc),
  })
  .key("id");
