
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import type { Nominal } from "./_type-helpers";
import { discordGuildDesc } from "./DiscordGuild";

export type DiscordMemberId = Nominal<string, "discordMember">;
export const discordMemberDesc = makeModel("discordMember")
  .fields({
    id: f.id<DiscordMemberId>(),
    discordUserId: f.string(),
    name: f.string(),
    nick: f.string(),
    avatar: f.string(),
    discriminator: f.string(),
    createdAt: f.date(),
    deckyScore: f.int(),
    discordGuildId: belongsTo("discordGuild", () => discordGuildDesc),
  })
  .hasMany({
    
  })
  .key("id");
