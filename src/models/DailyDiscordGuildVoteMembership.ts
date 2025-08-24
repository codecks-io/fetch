
import { makeModel, belongsTo } from "./_desc";
import * as f from "./_fields";
import { discordGuildDesc } from "./DiscordGuild";


export const dailyDiscordGuildVoteMembershipDesc = makeModel("dailyDiscordGuildVoteMembership")
  .fields({
    t: f.date(),
    membershipCount: f.int(),
    discordGuildId: belongsTo("discordGuild", () => discordGuildDesc),
  })
  .hasMany({
    
  })
  .compoundKey("t", "guildId");
