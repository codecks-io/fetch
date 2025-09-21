import {makeModel, relation} from "./_desc";
import * as f from "./_fields";
import type {Nominal} from "./_type-helpers";
import {type AccountId} from "./Account";

export type DiscordGuildId = Nominal<string, "discordGuild">;
export const discordGuildDesc = makeModel({
  name: "discordGuild",
  fields: {
    id: f.id<DiscordGuildId>(),
    discordGuildId: f.string({}),
    guildName: f.string({}),
    guildIconId: f.string({}),
    scope: f.string({}),
    karmaRoleThresholds: f.object({}),
    removeCommandEnabled: f.string({}),
    removeCommandEmoji: f.string({}),
    removeCommandRoleId: f.string({}),
    createdAt: f.date({}),
    accountId: f.belongsTo({}).type<AccountId>(),
  },
  relations: {
    account: relation("account", {type: "belongsTo", fk: "accountId"}),
    slashCommands: relation("discordSlashCommand", {type: "hasMany"}),
    projectNotifications: relation("discordProjectNotification", {type: "hasMany"}),
    dailyDiscordGuildVoteMemberships: relation("dailyDiscordGuildVoteMembership", {
      type: "hasMany",
    }),
    members: relation("discordMember", {type: "hasMany"}),
  },
  keys: ["id"],
});
