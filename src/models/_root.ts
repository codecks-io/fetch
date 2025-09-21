import {makeModel, relation} from "./_desc";

export const _rootDesc = makeModel({
  name: "_root",
  fields: {},
  relations: {
    releases: relation("release", {type: "hasMany"}),
    accountOnboardingSteps: relation("accountOnboardingStep", {type: "hasMany"}),
    apps: relation("app", {type: "hasMany"}),
    account: relation("account", {type: "hasOne"}),
    loggedInUser: relation("user", {type: "hasOne"}),
    cardsStatusHistory: relation("cardsStatusHistory", {type: "hasMany"}),
    cardsEffortHistory: relation("cardsEffortHistory", {type: "hasMany"}),
    cardsFinishedHistory: relation("cardsFinishedHistory", {type: "hasMany"}),
    cardsTimeToFinished: relation("cardsTimeToFinished", {type: "hasMany"}),
  },
  keys: [],
});
