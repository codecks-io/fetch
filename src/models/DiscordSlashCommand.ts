
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { deckDesc } from "./Deck";
import { discordGuildDesc } from "./DiscordGuild";

export type DiscordSlashCommandId = Nominal<string, "discordSlashCommand">;
export const discordSlashCommandDesc = makeModel("discordSlashCommand")
  .fields({
    id: f.id<DiscordSlashCommandId>(),
    channelId: f.string(),
    statusTargetChannelId: f.string(),
    reaction: f.string(),
    name: f.string(),
    description: f.string(),
    autoAddRoleToThread: f.string(),
    leaderboard: f.object<any>(),
    reactionThreshold: f.int(),
    karmaForCompletion: f.int(),
    maxFileSizeInBytes: f.int(),
    statusMessages: f.object<any>(),
    permissions: f.object<any>(),
    deckId: belongsTo("deck", () => deckDesc),
    discordGuildId: belongsTo("discordGuild", () => discordGuildDesc),
  })
  .hasMany({
    
  })
  .key("id");
