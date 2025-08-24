
import { makeModel, belongsTo, hasMany } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { accountDesc } from "./Account";
import { discordSlashCommandDesc } from "./DiscordSlashCommand";
import { discordProjectNotificationDesc } from "./DiscordProjectNotification";
import { dailyDiscordGuildVoteMembershipDesc } from "./DailyDiscordGuildVoteMembership";
import { discordMemberDesc } from "./DiscordMember";

export type DiscordGuildId = Nominal<string, "discordGuild">;
export const discordGuildDesc = makeModel("discordGuild")
  .fields({
    id: f.id<DiscordGuildId>(),
    discordGuildId: f.string(),
    guildName: f.string(),
    guildIconId: f.string(),
    scope: f.string(),
    karmaRoleThresholds: f.object<any>(),
    removeCommandEnabled: f.string(),
    removeCommandEmoji: f.string(),
    removeCommandRoleId: f.string(),
    createdAt: f.date(),
    accountId: belongsTo("account", () => accountDesc),
  })
  .hasMany({
    slashCommands: hasMany(() => discordSlashCommandDesc),
    projectNotifications: hasMany(() => discordProjectNotificationDesc),
    dailyDiscordGuildVoteMemberships: hasMany(() => dailyDiscordGuildVoteMembershipDesc),
    members: hasMany(() => discordMemberDesc),
  })
  .key("id");
