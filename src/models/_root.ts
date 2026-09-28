import {makeModel, relation} from "./_desc";

export const _rootDesc = makeModel({
  name: "_root",
  fields: {},
  relations: {
    account: relation("account", {type: "hasOne"}),
    loggedInUser: relation("user", {type: "hasOne"}),
    releases: relation("release", {type: "hasMany"}),
  },
  keys: [],
});
