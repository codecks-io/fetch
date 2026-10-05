import {makeModel, relation} from "./_desc";

/** The starting point of every query. */
export const _rootDesc = makeModel({
  name: "_root",
  fields: {},
  relations: {
    /** The organization the request is for. */
    account: relation("account", {type: "hasOne"}),
    /**
     * The user the request acts as. For an organization's API token it's the token's own user.
     * `null` when nobody is signed in.
     */
    loggedInUser: relation("user", {type: "hasOne"}),
    /** The entries of the Codecks changelog. */
    releases: relation("release", {type: "hasMany"}),
  },
  keys: [],
});
