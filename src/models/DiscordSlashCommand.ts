
import { makeModel, relation } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { type DeckId } from "./Deck";
import { type DiscordGuildId } from "./DiscordGuild";

export type DiscordSlashCommandId = Nominal<string, "discordSlashCommand">;
export const discordSlashCommandDesc = makeModel({
  name: "discordSlashCommand",
  fields: {
    id: f.id<DiscordSlashCommandId>(),
    channelId: f.string({}),
    statusTargetChannelId: f.string({}),
    reaction: f.string({}),
    name: f.string({}),
    description: f.string({}),
    autoAddRoleToThread: f.string({}),
    leaderboard: f.object({}),
    reactionThreshold: f.int({}),
    karmaForCompletion: f.int({}),
    maxFileSizeInBytes: f.int({}),
    statusMessages: f.object({}),
    permissions: f.object({}),
    deckId: f.belongsTo().type<DeckId>(),
    discordGuildId: f.belongsTo({}).type<DiscordGuildId>(),
  },
  relations: {
    deck: relation("deck", { type: "belongsTo", fk: "deckId" }),
    discordGuild: relation("discordGuild", { type: "belongsTo", fk: "discordGuildId" }),
  },
  keys: ["id"]
})